import { useEffect, useState } from "react";
import { Loader } from "./components/Loader";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Glance } from "./components/Glance";
import { Services } from "./components/Services";
import { Journey } from "./components/Journey";
import { WorkshopCrew } from "./components/WorkshopCrew";
import { Work } from "./components/Work";
import { Clients } from "./components/Clients";
import { Standards } from "./components/Standards";
import { Contact } from "./components/Contact";
import { LangProvider } from "./i18n/LangContext";
import { useLenis } from "./lib/useLenis";

/**
 * Section order follows the Company Profile 1:1:
 * Cover (Hero) → 01 About → 02 Vision & Mission → TAM at a Glance →
 * 03 Services → 04 How We Work → 05 Workshop & Crew → 06 Our Work →
 * 07 Our Clients → 08 Why TAM → 09 Contact → Thank You
 */
function Site() {
  const [ready, setReady] = useState(false);
  useLenis();

  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [ready]);

  return (
    <div className="relative bg-ink">
      <Loader onDone={() => setReady(true)} />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <About />
        <Glance />
        <Services />
        <Journey />
        <WorkshopCrew />
        <Work />
        <Clients />
        <Standards />
        <Contact />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Site />
    </LangProvider>
  );
}
