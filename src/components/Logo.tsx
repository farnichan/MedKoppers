import { APP_NAME } from "@/lib/config";

// Wordmark with "Kop" (Bangla slang: to ace something) highlighted.
// Falls back to the plain name if the app is renamed.
export default function Logo() {
  const at = APP_NAME.indexOf("Kop");
  return (
    <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <span
        aria-hidden
        className="grid size-8 -rotate-6 place-items-center rounded-lg border-2 border-ink bg-pink text-base shadow-hard-sm"
      >
        🩺
      </span>
      {at === -1 ? (
        APP_NAME
      ) : (
        <span>
          {APP_NAME.slice(0, at)}
          <span className="rounded-[0.2em] bg-yellow text-ink">Kop</span>
          {APP_NAME.slice(at + 3)}
        </span>
      )}
    </span>
  );
}
