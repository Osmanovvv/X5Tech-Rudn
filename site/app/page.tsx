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

export default function Home() {
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
      <Novosti />
      <LeadForm />
    </main>
  );
}
