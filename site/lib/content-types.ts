// Формы редактируемого контента секций. Файл БЕЗ серверных импортов: типы нужны и в админке
// (клиентские формы), и в серверных компонентах секций.
//
// Поля с суффиксом M — мобильные варианты текста. В макете часть подписей на узкой ширине
// набрана короче или с другими переносами, поэтому они хранятся отдельно; если поле пустое,
// вёрстка берёт десктопный вариант.

/* ── Программа обучения ── */

/** Дисциплина: либо просто подпись, либо подпись с настройками. */
export type Discipline = string | { label: string; ghost?: boolean; m?: string };

export type Course = {
  num: string;
  name: string;
  subtitle: string;
  /** Подзаголовок для мобильной (с макетными переносами). Пусто — берётся subtitle. */
  subM?: string;
  /** Имя файла фото курса без размера и расширения, либо «upload:<имя>» из админки. */
  photo?: string;
  /** true у курса, где вместо фото стоит карточка со статистикой. */
  stat?: boolean;
  disciplines: Discipline[];
};

export type ProgramContent = {
  title: string;
  badge: string;
  badgeM: string;
  courses: Course[];
  /** Лавандовая плашка после курса с номером after (1-based). */
  highlight: { after: number; title: string; text: string };
  /** Карточка «50%+» на месте фото четвёртого курса. */
  stat: { value: string; note: string };
};

/* ── Преподаватели ── */

export type Teacher = {
  /** Имя файла фото без размера и расширения, либо «upload:<имя>» из админки. */
  photo: string;
  /** Кроп из макета: высота картинки и сдвиг, оба в процентах. */
  crop: { h: number; top: number };
  /** true — фото занимает всю высоту карточки (у одного преподавателя в макете так). */
  fill?: boolean;
  name: string;
  spec: string;
};

export type TeachersContent = {
  title: string;
  titleM: string;
  subtitle: string;
  subtitleM: string;
  teachers: Teacher[];
};

/* ── Как поступить ── */

export type AdmissionStep = {
  date: string;
  title: string;
  text: string;
  /** Текст для мобильной. Пусто — берётся text. */
  m?: string;
};

export type AdmissionColumn = {
  heading: string;
  caption: string;
  captionM?: string;
  steps: AdmissionStep[];
};

export type AdmissionStat = {
  label: string;
  /** Вторая строка подписи (например «очное/бакалавриат»). */
  sub?: string;
  value: string;
  /** Приписка после числа («года»). */
  unit?: string;
};

export type ExamRow = {
  subject: string;
  required: string;
  budget: string;
  contract: string;
};

export type AdmissionContent = {
  title: string;
  subtitle: string;
  subtitleM: string;
  price: { label: string; value: string; note: string };
  stats: AdmissionStat[];
  budget: AdmissionColumn;
  contract: AdmissionColumn;
  exams: {
    title: string;
    caption: string;
    captionM?: string;
    columns: string[];
    rows: ExamRow[];
  };
};
