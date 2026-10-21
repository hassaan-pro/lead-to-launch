import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Journey } from "@/components/journey/Journey";
import { Evidence } from "@/components/landing/Evidence";
import { Pipeline } from "@/components/landing/Pipeline";
import { Directions } from "@/components/landing/Directions";
import { Rules } from "@/components/landing/Rules";
import { Closing } from "@/components/landing/Closing";
import { Footer } from "@/components/landing/Footer";
import { FloatingCta } from "@/components/landing/FloatingCta";
import { MotionOptIn } from "@/components/landing/MotionOptIn";
import { Marquee } from "@/components/landing/Marquee";
import { Proof } from "@/components/story/Proof";
import { Variety } from "@/components/story/Variety";
import { Truth } from "@/components/story/Truth";
import { Lights } from "@/components/story/Lights";

// Wide screens get the scroll story: the opening demo, then one pinned scene per idea.
// Phones and anyone who prefers reduced motion get the static sections, which say the same things.
export default function Landing() {
  return (
    <>
      <Nav />
      <main>
        <div className="journey-only"><Journey /></div>
        <div className="static-only"><Hero /></div>

        <Marquee />

        <div className="journey-only"><Proof /></div>
        <div className="static-only"><Evidence /></div>

        <div className="static-only"><Pipeline /></div>

        <div className="journey-only"><Variety /></div>
        <div className="static-only"><Directions /></div>

        <div className="journey-only"><Truth /></div>
        <div className="static-only"><Rules /></div>

        <div className="journey-only"><Lights /></div>
        <div className="static-only"><Closing /></div>
      </main>
      <Footer />
      <FloatingCta />
      <MotionOptIn />
    </>
  );
}
