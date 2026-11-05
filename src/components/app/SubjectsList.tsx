import PixelArt from "@/components/pixel/PixelArt";
import { BOLD_CAPSULE, capsule } from "@/components/pixel/art";
import { COPY } from "@/lib/copy";

const PILL = capsule(8, BOLD_CAPSULE);

/** Sidebar "Subjects" section. Only Pharmacology for now. */
export default function SubjectsList() {
  const t = COPY.app.nav;
  return (
    <div>
      <p className="px-2 pb-1.5 text-xs font-medium text-subtle">{t.subjects}</p>
      <div className="flex h-8 items-center gap-2.5 px-2 text-sm font-medium text-ink">
        <span aria-hidden className="grid size-5 place-items-center rounded-[5px] bg-tint-blue">
          <PixelArt rows={PILL} size={14} />
        </span>
        {t.pharmacology}
      </div>
      <p className="px-2 pt-1 text-xs text-subtle">{t.comingSoon}</p>
    </div>
  );
}
