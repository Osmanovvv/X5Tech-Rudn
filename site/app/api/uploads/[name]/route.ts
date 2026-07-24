// Отдача загруженных обложек из DATA_DIR/uploads (Task B3).
// Публичный роут (обложки видны на сайте), но читает только файлы со строго проверенным именем —
// см. readUpload(): шаблон имени + проверка на выход за пределы каталога.
import { readUpload } from "@/lib/server/uploads";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const data = readUpload(name);
  if (!data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      // Имя файла содержит метку времени и не переиспользуется — можно кэшировать надолго
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
