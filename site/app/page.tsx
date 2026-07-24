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

export default function Home() {
  // Правило роста (Task 2.11): в карусели — последние 6 новостей по дате.
  // Читаем на сервере (DATA_DIR) и передаём в клиентский остров пропсами.
  const news = latest(getAllNews(), 6);

  return (
    <main>
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
