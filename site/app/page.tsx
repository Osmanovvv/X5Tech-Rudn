import Hero from "@/components/sections/Hero";
import KakPostupit from "@/components/sections/KakPostupit";
import ProgrammaDaet from "@/components/sections/ProgrammaDaet";
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
    </main>
  );
}
