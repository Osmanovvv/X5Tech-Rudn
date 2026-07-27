// Разметка Schema.org (Task 5.1) — расширенные сниппеты Яндекса и Google.
// Server Component: JSON уходит в HTML, в клиентский бандл не попадает ничего.
//
// В разметку кладём только то, что не является предметом открытых вопросов к клиенту:
// стоимость обучения (C1) и часть контактов (C2) в макетах расходятся, поэтому цены и телефона
// здесь нет — ошибочный Offer в выдаче хуже его отсутствия.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Экранируем "<", чтобы строка из контента не могла закрыть тег <script> раньше времени
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
