import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Evidence } from "@/components/landing/Evidence";
import { Pipeline } from "@/components/landing/Pipeline";
import { Directions } from "@/components/landing/Directions";
import { Rules } from "@/components/landing/Rules";
import { Closing } from "@/components/landing/Closing";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Evidence />
        <Pipeline />
        <Directions />
        <Rules />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
