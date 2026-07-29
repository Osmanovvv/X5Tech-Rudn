// Хранилище редактируемых секций (Программа обучения, Преподаватели, Как поступить).
// ТОЛЬКО СЕРВЕР (через store.ts тянет node:fs).
//
// Устроено ровно как news-store: источник правды — DATA_DIR/<файл>.json, который правит админка,
// а пока файла нет — сид из репозитория (content/<файл>.json). Значит сразу после деплоя сайт
// показывает содержимое из сборки, а первая правка в админке создаёт файл в DATA_DIR и
// переживает следующие деплои.
//
// Читаем ВНУТРИ функций, а не на уровне модуля: после revalidatePath страница должна перечитать
// файл, а не отдать снимок, снятый при импорте.
import programSeed from "@/content/program.json";
import teachersSeed from "@/content/teachers.json";
import admissionSeed from "@/content/admission.json";
import { readJson, readJsonSafe, writeJson } from "./store";
import type { AdmissionContent, ProgramContent, TeachersContent } from "@/lib/content-types";

// В статической сборке (STATIC=1) сервера нет вовсе: данные берутся только из репозитория.
// Иначе выгрузка на чужой хостинг показывала бы содержимое чужого DATA_DIR — то есть ничего.
const useStored = !process.env.STATIC;

export type ContentMap = {
  program: ProgramContent;
  teachers: TeachersContent;
  admission: AdmissionContent;
};
export type SectionKey = keyof ContentMap;

// Присваивание типизированной константе — настоящая проверка формы: если контентный JSON
// перестанет соответствовать типу, сборка упадёт здесь. При этом тип остаётся широким
// (не литеральным выводом из JSON), иначе админка не смогла бы записать сюда новое значение.
const SEEDS: ContentMap = {
  program: programSeed,
  teachers: teachersSeed,
  admission: admissionSeed,
};

const FILES: Record<SectionKey, string> = {
  program: "program.json",
  teachers: "teachers.json",
  admission: "admission.json",
};

type SeedOf<K extends SectionKey> = ContentMap[K];

/** Содержимое секции для показа. Повреждённый файл не роняет страницу — отдаём сид. */
export function readSection<K extends SectionKey>(key: K): SeedOf<K> {
  if (!useStored) return SEEDS[key];
  return readJsonSafe<SeedOf<K>>(FILES[key], SEEDS[key]);
}

/**
 * То же, но СТРОГО: повреждённый файл бросает исключение. Обязательно использовать перед
 * записью из админки — иначе правка записала бы сид поверх настоящих данных, то есть
 * молча стёрла бы всё, что редактор вводил до этого.
 */
export function readSectionForEdit<K extends SectionKey>(key: K): SeedOf<K> {
  return readJson<SeedOf<K>>(FILES[key], SEEDS[key]);
}

/** Полная перезапись секции (админка). Запись атомарная, очередь на файл — в store.ts. */
export function saveSection<K extends SectionKey>(key: K, value: SeedOf<K>): Promise<void> {
  return writeJson(FILES[key], value);
}

/** Исходное содержимое из репозитория — для кнопки «вернуть как было». */
export function sectionSeed<K extends SectionKey>(key: K): SeedOf<K> {
  return SEEDS[key];
}
