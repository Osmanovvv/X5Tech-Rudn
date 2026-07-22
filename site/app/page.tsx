import Hero from "@/components/sections/Hero";
import ProgrammaDaet from "@/components/sections/ProgrammaDaet";
import ProgrammaObucheniya from "@/components/sections/ProgrammaObucheniya";
import TebeKNam from "@/components/sections/TebeKNam";

export default function Home() {
  return (
    <main>
      <Hero />
      <TebeKNam />
      <ProgrammaDaet />
      <ProgrammaObucheniya />
    </main>
  );
}
