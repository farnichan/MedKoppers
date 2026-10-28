import { COPY } from "@/lib/copy";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div aria-hidden className="zigzag border-t-2 border-ink" />
      <div className="border-t-2 border-ink bg-ink text-cream">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="space-y-1 sm:text-right">
            <p>{COPY.footer.madeWith}</p>
            <p className="text-cream/60">{COPY.footer.disclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
