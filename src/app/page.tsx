import Link from "next/link";
import { OptionContent, optionRowClass, type OptionState } from "@/components/OptionRow";
import Sticker from "@/components/ui/Sticker";
import { buttonClass } from "@/components/ui/button";
import { COPY } from "@/lib/copy";

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <Hero />
      <Relatable />
      <HowItWorks />
      <FinalCta />
    </main>
  );
}

function Hero() {
  const h = COPY.hero;
  return (
    <section className="relative mx-auto grid max-w-5xl items-center gap-12 px-5 pt-32 pb-16 sm:pt-40 lg:grid-cols-[1.1fr_1fr] lg:pb-24">
      <div>
        <Sticker color="teal" tilt={-4}>
          {h.sticker}
        </Sticker>
        <h1 className="mt-6 text-[3.2rem] leading-[0.95] font-extrabold tracking-[-0.035em] sm:text-7xl">
          {h.titleTop}
          <br />
          {h.titleBottomBefore}
          <span className="marker inline-block -rotate-2">{h.titleHighlight}</span>
          {h.titleBottomAfter}
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{h.subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/practice" className={buttonClass({ size: "lg" })}>
            {h.cta} <span aria-hidden>→</span>
          </Link>
          <span className="text-sm font-medium text-muted">{h.ctaNote}</span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <QuestionPreview />
        {/* Decorative stickers around the card, on larger screens. */}
        <div aria-hidden className="hidden sm:block">
          <Sticker color="yellow" tilt={-8} className="absolute -top-5 -left-6">
            {COPY.floatingStickers[0]}
          </Sticker>
          <Sticker color="sky" tilt={6} className="absolute top-1/2 -right-4">
            {COPY.floatingStickers[1]}
          </Sticker>
          <Sticker color="orange" tilt={-5} className="absolute -bottom-6 left-4">
            {COPY.floatingStickers[2]}
          </Sticker>
        </div>
      </div>
    </section>
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
    <div aria-hidden className="relative rotate-1 rounded-2xl border-2 border-ink bg-paper p-5 shadow-hard-lg">
      <div className="mb-3 flex items-center justify-between text-xs font-bold">
        <span className="text-muted">Q7 · Autonomic nervous system</span>
      </div>
      <p className="mb-4 text-lg leading-snug font-bold">
        Which drug reactivates acetylcholinesterase in organophosphate poisoning?
      </p>
      <div className="space-y-2">
        {PREVIEW_OPTIONS.map((o, i) => (
          <div key={o.text} className={optionRowClass(o.state, false)}>
            <OptionContent index={i} text={o.text} state={o.state} />
          </div>
        ))}
      </div>
      <span className="absolute -top-4 -right-3 rotate-12 rounded-full border-2 border-ink bg-yellow px-3 py-1.5 text-sm font-extrabold tracking-wide shadow-hard-sm">
        {COPY.preview.stamp}
      </span>
    </div>
  );
}

function Relatable() {
  const tilts = [-1.5, 1, -0.5];
  const colors = ["bg-sky", "bg-yellow", "bg-pink"];
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h2 className="mb-8 text-4xl font-extrabold tracking-tight">{COPY.relatable.title}</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {COPY.relatable.cards.map((card, i) => (
          <article
            key={card.title}
            style={{ rotate: `${tilts[i]}deg` }}
            className="rounded-2xl border-2 border-ink bg-paper shadow-hard transition-[rotate] hover:rotate-0"
          >
            <h3 className={`rounded-t-[14px] border-b-2 border-ink px-4 py-2.5 font-extrabold ${colors[i]}`}>
              {card.title}
            </h3>
            <div className="space-y-1.5 px-4 py-4 font-medium">
              {card.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h2 className="mb-8 text-4xl font-extrabold tracking-tight">{COPY.howItWorks.title}</h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {COPY.howItWorks.steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-2xl border-2 border-ink bg-paper p-5 shadow-hard">
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink bg-cream text-2xl"
            >
              {step.emoji}
            </span>
            <div>
              <p className="text-sm font-bold text-muted">Step {i + 1}</p>
              <h3 className="text-lg font-extrabold">{step.title}</h3>
              <p className="mt-1 text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FinalCta() {
  const c = COPY.finalCta;
  return (
    <section className="mx-auto max-w-5xl px-5 pt-8 pb-24">
      <div className="rounded-3xl border-2 border-ink bg-teal px-6 py-12 text-center shadow-hard-lg">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{c.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-lg font-medium">{c.subtitle}</p>
        <Link href="/practice" className={buttonClass({ variant: "yellow", size: "lg", className: "mt-8" })}>
          {c.cta} <span aria-hidden>🚀</span>
        </Link>
      </div>
    </section>
  );
}
