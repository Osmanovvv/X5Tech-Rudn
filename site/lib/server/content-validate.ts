// Проверка контента секций перед записью. ТОЛЬКО СЕРВЕР.
//
// Server Actions вызываются по сети напрямую, поэтому клиентской форме верить нельзя: сюда
// может прийти какой угодно JSON. Разбираем его поле за полем и собираем ЧИСТЫЙ объект —
// ничего лишнего в файл не попадает, даже если в запросе были посторонние ключи.
//
// Ограничения длин — не придирка, а защита файла данных: без них одна отправка могла бы
// записать мегабайты и сломать страницу, которая этот контент показывает.
import type {
  AdmissionColumn,
  AdmissionContent,
  AdmissionStat,
  AdmissionStep,
  Course,
  Discipline,
  ExamRow,
  ProgramContent,
  Teacher,
  TeachersContent,
} from "@/lib/content-types";

export class ContentInvalidError extends Error {}

const fail = (where: string, why: string): never => {
  throw new ContentInvalidError(`${where}: ${why}`);
};

/** Строка с обрезкой краёв. Переносы внутри сохраняем — на них держатся макетные разбивки. */
function str(v: unknown, where: string, opts: { max: number; required?: boolean }): string {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") fail(where, "ожидалась строка");
  // \r из Windows-переносов убираем: иначе они попадут в whitespace-pre-line и дадут лишние строки
  const s = (v as string).replace(/\r\n?/g, "\n").trim();
  if (opts.required && !s) fail(where, "поле обязательно");
  if (s.length > opts.max) fail(where, `длиннее ${opts.max} символов`);
  return s;
}

function num(v: unknown, where: string, opts: { min: number; max: number }): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) fail(where, "ожидалось число");
  if (n < opts.min || n > opts.max) fail(where, `вне диапазона ${opts.min}…${opts.max}`);
  return n;
}

function arr<T>(v: unknown, where: string, max: number, map: (item: unknown, i: number) => T): T[] {
  if (!Array.isArray(v)) fail(where, "ожидался список");
  const list = v as unknown[];
  if (list.length > max) fail(where, `больше ${max} элементов`);
  return list.map(map);
}

const obj = (v: unknown, where: string): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) fail(where, "ожидался объект");
  return v as Record<string, unknown>;
};

/**
 * Имя картинки: либо файл из сборки (латиница, цифры, дефис), либо «upload:<имя>» из админки.
 * Проверка нужна не для красоты: имя подставляется в путь, и без неё сюда прошло бы «../».
 */
function photoName(v: unknown, where: string, required: boolean): string {
  const s = str(v, where, { max: 120, required });
  if (!s) return "";
  if (!/^(upload:)?[a-z0-9][a-z0-9-]*$/i.test(s)) fail(where, "недопустимое имя файла");
  return s;
}

/* ── Программа обучения ── */

function discipline(v: unknown, where: string): Discipline {
  // Простая подпись остаётся строкой — так же, как в макетном JSON
  if (typeof v === "string") return str(v, where, { max: 200, required: true });
  const o = obj(v, where);
  const label = str(o.label, `${where}.label`, { max: 200, required: true });
  const m = str(o.m, `${where}.m`, { max: 200 });
  const ghost = Boolean(o.ghost);
  // Если настроек нет — храним строкой, чтобы файл не пух лишними объектами
  if (!m && !ghost) return label;
  return { label, ...(ghost ? { ghost: true } : {}), ...(m ? { m } : {}) };
}

function course(v: unknown, where: string): Course {
  const o = obj(v, where);
  const photo = photoName(o.photo, `${where}.photo`, false);
  const stat = Boolean(o.stat);
  if (!photo && !stat) fail(where, "у курса должно быть фото либо отметка «карточка со статистикой»");
  return {
    num: str(o.num, `${where}.num`, { max: 40, required: true }),
    name: str(o.name, `${where}.name`, { max: 120, required: true }),
    subtitle: str(o.subtitle, `${where}.subtitle`, { max: 300, required: true }),
    ...(str(o.subM, `${where}.subM`, { max: 300 }) ? { subM: str(o.subM, `${where}.subM`, { max: 300 }) } : {}),
    ...(photo ? { photo } : {}),
    ...(stat ? { stat: true } : {}),
    disciplines: arr(o.disciplines, `${where}.disciplines`, 30, (d, i) =>
      discipline(d, `${where}.disciplines[${i}]`),
    ),
  };
}

export function validateProgram(input: unknown): ProgramContent {
  const o = obj(input, "программа");
  const courses = arr(o.courses, "курсы", 12, (c, i) => course(c, `курс ${i + 1}`));
  if (courses.length === 0) fail("курсы", "нужен хотя бы один курс");
  const h = obj(o.highlight, "плашка");
  const s = obj(o.stat, "карточка статистики");
  return {
    title: str(o.title, "заголовок", { max: 120, required: true }),
    badge: str(o.badge, "бейдж", { max: 300, required: true }),
    badgeM: str(o.badgeM, "бейдж (мобильный)", { max: 300, required: true }),
    courses,
    highlight: {
      after: num(h.after, "плашка.после курса", { min: 1, max: courses.length }),
      title: str(h.title, "плашка.заголовок", { max: 200, required: true }),
      text: str(h.text, "плашка.текст", { max: 400, required: true }),
    },
    stat: {
      value: str(s.value, "статистика.значение", { max: 20, required: true }),
      note: str(s.note, "статистика.подпись", { max: 200, required: true }),
    },
  };
}

/* ── Преподаватели ── */

function teacher(v: unknown, where: string): Teacher {
  const o = obj(v, where);
  const crop = obj(o.crop, `${where}.кроп`);
  return {
    photo: photoName(o.photo, `${where}.фото`, true),
    crop: {
      h: num(crop.h, `${where}.кроп.высота`, { min: 10, max: 400 }),
      top: num(crop.top, `${where}.кроп.сдвиг`, { min: -300, max: 300 }),
    },
    ...(o.fill ? { fill: true } : {}),
    name: str(o.name, `${where}.ФИО`, { max: 120, required: true }),
    spec: str(o.spec, `${where}.специализация`, { max: 400, required: true }),
  };
}

export function validateTeachers(input: unknown): TeachersContent {
  const o = obj(input, "преподаватели");
  const teachers = arr(o.teachers, "список", 40, (t, i) => teacher(t, `преподаватель ${i + 1}`));
  if (teachers.length === 0) fail("список", "нужен хотя бы один преподаватель");
  return {
    title: str(o.title, "заголовок", { max: 120, required: true }),
    titleM: str(o.titleM, "заголовок (мобильный)", { max: 120, required: true }),
    subtitle: str(o.subtitle, "подзаголовок", { max: 400, required: true }),
    subtitleM: str(o.subtitleM, "подзаголовок (мобильный)", { max: 400, required: true }),
    teachers,
  };
}

/* ── Как поступить ── */

function step(v: unknown, where: string): AdmissionStep {
  const o = obj(v, where);
  const m = str(o.m, `${where}.текст (мобильный)`, { max: 400 });
  return {
    date: str(o.date, `${where}.срок`, { max: 60, required: true }),
    title: str(o.title, `${where}.заголовок`, { max: 160, required: true }),
    text: str(o.text, `${where}.текст`, { max: 400, required: true }),
    ...(m ? { m } : {}),
  };
}

function column(v: unknown, where: string): AdmissionColumn {
  const o = obj(v, where);
  const captionM = str(o.captionM, `${where}.подпись (мобильная)`, { max: 300 });
  const steps = arr(o.steps, `${where}.этапы`, 12, (s, i) => step(s, `${where}, этап ${i + 1}`));
  if (steps.length === 0) fail(`${where}.этапы`, "нужен хотя бы один этап");
  return {
    heading: str(o.heading, `${where}.заголовок`, { max: 120, required: true }),
    caption: str(o.caption, `${where}.подпись`, { max: 300, required: true }),
    ...(captionM ? { captionM } : {}),
    steps,
  };
}

function stat(v: unknown, where: string): AdmissionStat {
  const o = obj(v, where);
  const sub = str(o.sub, `${where}.вторая строка`, { max: 80 });
  const unit = str(o.unit, `${where}.приписка`, { max: 20 });
  return {
    label: str(o.label, `${where}.подпись`, { max: 80, required: true }),
    ...(sub ? { sub } : {}),
    value: str(o.value, `${where}.значение`, { max: 20, required: true }),
    ...(unit ? { unit } : {}),
  };
}

function examRow(v: unknown, where: string): ExamRow {
  const o = obj(v, where);
  return {
    subject: str(o.subject, `${where}.предмет`, { max: 120, required: true }),
    required: str(o.required, `${where}.условие`, { max: 200, required: true }),
    budget: str(o.budget, `${where}.бюджет`, { max: 20, required: true }),
    contract: str(o.contract, `${where}.контракт`, { max: 20, required: true }),
  };
}

export function validateAdmission(input: unknown): AdmissionContent {
  const o = obj(input, "как поступить");
  const p = obj(o.price, "стоимость");
  const e = obj(o.exams, "экзамены");
  const columns = arr(e.columns, "экзамены.колонки", 4, (c, i) =>
    str(c, `экзамены.колонка ${i + 1}`, { max: 120, required: true }),
  );
  if (columns.length !== 4) fail("экзамены.колонки", "в таблице ровно четыре колонки");
  const rows = arr(e.rows, "экзамены.строки", 12, (r, i) => examRow(r, `экзамены, строка ${i + 1}`));
  if (rows.length === 0) fail("экзамены.строки", "нужна хотя бы одна строка");
  const stats = arr(o.stats, "показатели", 3, (s, i) => stat(s, `показатель ${i + 1}`));
  if (stats.length !== 3) fail("показатели", "их ровно три — по числу карточек в макете");
  const captionM = str(e.captionM, "экзамены.подпись (мобильная)", { max: 300 });
  return {
    title: str(o.title, "заголовок", { max: 120, required: true }),
    subtitle: str(o.subtitle, "подзаголовок", { max: 400, required: true }),
    subtitleM: str(o.subtitleM, "подзаголовок (мобильный)", { max: 400, required: true }),
    price: {
      label: str(p.label, "стоимость.подпись", { max: 80, required: true }),
      value: str(p.value, "стоимость.значение", { max: 80, required: true }),
      note: str(p.note, "стоимость.сноска", { max: 120, required: true }),
    },
    stats,
    budget: column(o.budget, "бюджет"),
    contract: column(o.contract, "договор"),
    exams: {
      title: str(e.title, "экзамены.заголовок", { max: 120, required: true }),
      caption: str(e.caption, "экзамены.подпись", { max: 300, required: true }),
      ...(captionM ? { captionM } : {}),
      columns,
      rows,
    },
  };
}
