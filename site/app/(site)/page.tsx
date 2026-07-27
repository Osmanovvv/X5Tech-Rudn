import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Grant from "@/components/sections/Grant";
import Hero from "@/components/sections/Hero";
import KakPostupit from "@/components/sections/KakPostupit";
import LeadForm from "@/components/sections/LeadForm";
import Most from "@/components/sections/Most";
import Novosti from "@/components/sections/Novosti";
import Prepodavateli from "@/components/sections/Prepodavateli";
import ProgrammaDaet from "@/components/sections/ProgrammaDaet";
import Tehnologii from "@/components/sections/Tehnologii";
import ProgrammaObucheniya from "@/components/sections/ProgrammaObucheniya";
import TebeKNam from "@/components/sections/TebeKNam";
import Treki from "@/components/sections/Treki";
import { getAllNews, newsMeta } from "@/lib/server/news-store";
import { latest } from "@/lib/news";
import { abs, DEFAULT_DESCRIPTION, og, PROGRAM_NAME, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: abs("/") },
  openGraph: og({ url: abs("/") }),
};

// Schema.org: университет + сама образовательная программа. Стоимость и телефон не включаем —
// по ним открытые вопросы к клиенту (C1, C2), а неверный Offer в выдаче хуже отсутствующего.
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": abs("/#website"),
      url: abs("/"),
      name: SITE_NAME,
      inLanguage: "ru-RU",
      description: DEFAULT_DESCRIPTION,
    },
    {
      "@type": "CollegeOrUniversity",
      "@id": abs("/#org"),
      name: "Российский университет дружбы народов имени Патриса Лумумбы",
      alternateName: "РУДН",
      url: "https://www.rudn.ru/",
      sameAs: ["https://www.rudn.ru/"],
      logo: abs("/img/01-hero/logo-rudn-2x.webp"),
      address: {
        "@type": "PostalAddress",
        addressCountry: "RU",
        addressLocality: "Москва",
        postalCode: "117198",
        streetAddress: "ул. Миклухо-Маклая, д. 6",
      },
      department: {
        "@type": "EducationalOrganization",
        name: "Факультет искусственного интеллекта",
        url: abs("/"),
      },
    },
    {
      "@type": "EducationalOccupationalProgram",
      "@id": abs("/#program"),
      name: PROGRAM_NAME,
      description: DEFAULT_DESCRIPTION,
      url: abs("/"),
      programType: "Бакалавриат",
      educationalCredentialAwarded: "Бакалавр",
      educationalProgramMode: "full-time",
      timeToComplete: "P4Y",
      inLanguage: "ru-RU",
      provider: { "@id": abs("/#org") },
      occupationalCategory: [
        "Инженер машинного обучения",
        "Data Scientist",
        "Разработчик систем искусственного интеллекта",
      ],
      about: { "@type": "Thing", name: "Искусственный интеллект" },
    },
  ],
};

export default function Home() {
  // Правило роста (Task 2.11): в карусели — последние 6 новостей по дате.
  // Читаем на сервере (DATA_DIR) и передаём в клиентский остров пропсами.
  const news = latest(getAllNews(), 6);

  return (
    <main>
      <JsonLd data={schema} />
      <Hero />
      <TebeKNam />
      <ProgrammaDaet />
      <ProgrammaObucheniya />
      <Treki />
      <KakPostupit />
      <Prepodavateli />
      <Most />
      <Tehnologii />
      <Grant />
      <Novosti items={news} title={newsMeta.title} allLabel={newsMeta.allLabel} />
      <LeadForm />
    </main>
  );
}
