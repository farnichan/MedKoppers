// All the jokes and playful text in one place, so they're easy to edit
// without touching layout code. Banglish (Bangla in English letters) on
// purpose: it's how students actually text each other.

// Note: "10 ta" in a few lines matches QUESTIONS_PER_TEST in config.ts;
// update both if you change the number.
export const COPY = {
  hero: {
    sticker: "BD med students only 🩺",
    titleTop: "Pera nai.",
    titleBottomBefore: "Prof-e ",
    titleHighlight: "kop",
    titleBottomAfter: " koro.",
    subtitle:
      "Pharmacology MCQ practice for Bangladeshi med students. 10 ta random question, instant marks, zero login. Cha thanda howar agei shesh.",
    cta: "Start practice test",
    ctaNote: "Free. Proxy lagbe na. 😌",
  },

  // Little stickers scattered around the hero (desktop only).
  floatingStickers: ["💊 300 ta drug name", "☕ Cha break?", "Sir, eta ki ashbe? 🤔"],

  relatable: {
    title: "Relatable? 😅",
    cards: [
      {
        title: "Viva board energy",
        lines: ["Sir: “Atropine poisoning er antidote ki?”", "Me: *forgets own name*"],
      },
      {
        title: "Prof er age raat",
        lines: ["✅ 300 ta drug name", "✅ 1 ta working brain cell", "❌ Ghum"],
      },
      {
        title: "Load shedding @ 2 AM",
        lines: ["Exam: 9 AM", "Fan: off", "Motivation: gone", "MedKoppers: still here 💅"],
      },
    ],
  },

  howItWorks: {
    title: "Kivabe kaj kore?",
    steps: [
      { emoji: "🎲", title: "10 ta random MCQ", text: "Prottek bar notun set. Mukhosto kore pass korar scope nai." },
      { emoji: "📝", title: "Khata joma dao", text: "Answer select koro, submit chapo. Negative marking nai!" },
      { emoji: "⚡", title: "Instant result", text: "Kon gula kop korle, kon gula bash khaile, shob dekhabe." },
    ],
  },

  preview: {
    stamp: "KOPAISO!",
  },

  finalCta: {
    title: "Ready to kop?",
    subtitle: "Cha banate jotokkhon lage, totokkhone 10 ta question shesh.",
    cta: "Let's goooo",
  },

  footer: {
    madeWith: "Made with ☕ cha & last-minute pera in Bangladesh.",
    disclaimer: "Not affiliated with BMDC, DGHS, or your very strict pharma sir.",
  },

  practice: {
    titleSticker: "💊 10 ta random question",
    subtitle:
      "Prottek question e ekta answer select koro, tarpor khata joma dao. Negative marking nai, so confidently guess maro. 😉",
    loading: "Nilkhet theke sheet photocopy hocche…",
    empty: "Ekhono kono question nai. Pore check koro!",
    submit: "Khata joma dao 📝",
    submitting: "Sir khata check korchen…",
    unansweredNote: "Faka rakhle marks nai. Negative marking nai, guess maro!",
    error: "Kichu ekta gondogol hoise 😵 Abar try koro.",
    tryAgain: "Notun 10 ta question",
    loadingNew: "Notun set anchi…",
  },

  // Encouragement under the progress bar, by how far along the student is.
  progress(answered: number, total: number) {
    if (answered === 0) return "Shuru koro, bismillah 🙏";
    if (answered === total) return "Shob done! Ebar khata joma dao 🎉";
    if (answered / total >= 0.7) return "Aar ektu! 💪";
    return "Cholche, cholbe 🚶";
  },

  // Status labels on each question after marking.
  status: {
    correct: "Kop! ✓",
    wrong: "Bhul ✗",
    skipped: "Skip 👻",
    notMarked: "Not marked",
  },
} as const;

/** A meme-y reaction for the score card. */
export function scoreReaction(score: number, total: number, answered: number) {
  const percent = total ? score / total : 0;
  if (answered === 0)
    return { emoji: "👻", title: "Proxy diye exam hoy na mama.", line: "Antoto ekta question to answer koro!" };
  if (percent === 1)
    return { emoji: "🐐", title: "KOPAISO MAMA!", line: "Full marks. Tripathi nijeo impressed." };
  if (percent >= 0.8)
    return { emoji: "🔥", title: "Joss!", line: "Ward e giye ektu bhab nite paro." };
  if (percent >= 0.6)
    return { emoji: "😎", title: "Pass! Supple er bhoy nai.", line: "Ar ektu porle top e chole jabe." };
  if (percent >= 0.4)
    return { emoji: "😅", title: "Borderline…", line: "Viva te sweet smile diye manage koro." };
  return { emoji: "💀", title: "Bash khaiso.", line: "Pera nai. Ek cup cha khao, abar try koro." };
}
