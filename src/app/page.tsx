import Link from "next/link";
import { OptionContent, optionRowClass, type OptionState } from "@/components/OptionRow";
import TopicTag from "@/components/TopicTag";
import PixelArt from "@/components/pixel/PixelArt";
import BlinkingCells from "@/components/pixel/BlinkingCells";
import {
  ANSWER_SHEET,
  BOLD_CAPSULE,
  LIGHTNING,
  PHONE,
  SPARKLE,
  SPARKLE_LIME,
  capsule,
} from "@/components/pixel/art";
import { buttonClass } from "@/components/ui/button";
import { COPY } from "@/lib/copy";

const HERO_CAPSULE = capsule(28);
const FEATURE_ART = [
  { rows: ANSWER_SHEET, tint: "bg-tint-blue" },
  { rows: LIGHTNING, tint: "bg-tint-peach" },
  { rows: PHONE, tint: "bg-tint-lime" },
];

// Twinkles around the floating capsule: position (as % of the capsule box),
// size and animation delay.
const SPARKLES = [
  { top: "4%", left: "8%", size: 15, delay: "0s", lime: false },
  { top: "18%", left: "92%", size: 20, delay: "0.8s", lime: true },
  { top: "78%", left: "4%", size: 20, delay: "1.4s", lime: true },
  { top: "88%", left: "80%", size: 15, delay: "0.4s", lime: false },
];

export default function Home() {
  const h = COPY.hero;
  return (
    <main>
      {/* Full-screen, two-column hero. The floating navbar sits over its top edge. */}
      <section className="graph-paper relative flex min-h-svh items-center overflow-hidden border-b border-line">
        <BlinkingCells keepOutIds={["hero-copy", "hero-card"]} />

        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-14 px-5 pt-28 pb-16 md:grid-cols-[1.05fr_1fr] md:gap-10">
          <div id="hero-copy">
            <div className="relative">
              {/* Big soft floating capsule: above the headline on phones, behind it on larger screens. */}
              <div
                aria-hidden
                className="pointer-events-none relative mb-6 w-[130px] md:absolute md:top-[42%] md:left-[32%] md:mb-0 md:w-[230px] md:-translate-x-1/2 md:-translate-y-1/2"
              >
                <div className="animate-float">
                  <PixelArt rows={HERO_CAPSULE} size={300} className="h-auto w-full md:opacity-70" />
                </div>
                {SPARKLES.map((sp) => (
                  <span
                    key={sp.top + sp.left}
                    className="animate-twinkle absolute"
                    style={{ top: sp.top, left: sp.left, animationDelay: sp.delay }}
                  >
                    <PixelArt rows={sp.lime ? SPARKLE_LIME : SPARKLE} size={sp.size} />
                  </span>
                ))}
              </div>
              <h1 className="font-heading relative text-[3.25rem] leading-[1] font-bold tracking-[-0.03em] text-balance md:text-7xl lg:text-[5.75rem]">
                {h.title}
              </h1>
            </div>
            <p className="mt-5 max-w-md text-lg leading-relaxed font-medium text-pretty text-ink/75 md:mt-9">
              {h.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/practice" className={buttonClass({ size: "lg" })}>
                {h.cta}
              </Link>
            </div>
          </div>

          <div id="hero-card" className="relative mx-auto w-full max-w-md">
            <QuestionPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-[-0.01em] sm:text-4xl">{COPY.featuresTitle}</h2>
            <p className="mt-2 font-medium text-muted">{COPY.featuresSubtitle}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-tint-blue px-3.5 py-1.5 text-sm font-semibold">
            <PixelArt rows={capsule(12, BOLD_CAPSULE)} size={18} />
            {h.eyebrow}
          </span>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {COPY.features.map((f, i) => (
            <li
              key={f.title}
              className="card-grid rounded-2xl border-2 border-line bg-white p-6 transition-[translate,box-shadow,border-color] hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_6px_0_0_rgb(16_18_31/0.08)]"
            >
              <span className={`grid size-14 place-items-center rounded-xl ${FEATURE_ART[i].tint}`}>
                <PixelArt rows={FEATURE_ART[i].rows} size={36} />
              </span>
              <h3 className="font-heading mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 leading-relaxed font-medium text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}

const PREVIEW_OPTIONS: { text: string; state: OptionState }[] = [
  { text: "Atropine", state: "idle" },
  { text: "Physostigmine", state: "idle" },
  { text: "Pralidoxime", state: "correct" },
  { text: "Neostigmine", state: "idle" },
];

// A static, non-interactive example of a marked question.
function QuestionPreview() {
  return (
    <div
      aria-hidden
      className="card-grid rounded-2xl border-2 border-line bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_48px_-24px_rgb(12_24_146/0.3)] sm:p-6"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-white">Q7</span>
          <TopicTag topic="Autonomic nervous system" />
        </span>
        <span className="rounded-full bg-correct-soft px-2.5 py-1 text-xs font-bold text-correct">
          {COPY.status.correct}
        </span>
      </div>
      <p className="mb-4 text-[17px] leading-snug font-semibold">
        Which drug reactivates acetylcholinesterase in organophosphate poisoning?
      </p>
      <div className="space-y-2">
        {PREVIEW_OPTIONS.map((o, i) => (
          <div key={o.text} className={optionRowClass(o.state, false)}>
            <OptionContent index={i} text={o.text} state={o.state} />
          </div>
        ))}
      </div>
    </div>
  );
}
