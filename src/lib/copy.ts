// All user-facing text in one place, so it's easy to edit without touching
// layout code. Tone: plain, clear and regular for now. No game wording
// (XP, levels, "game over") and no jokes; those may be added later.

import { QUESTIONS_PER_TEST } from "./config";

export const COPY = {
  nav: {
    cta: "Take test",
  },

  hero: {
    eyebrow: "Pharmacology · more subjects coming soon",
    title: "Ace your prof finals",
    subtitle: `Exam-style Pharmacology questions for MBBS students in Bangladesh. ${QUESTIONS_PER_TEST} random questions at a time, marked instantly.`,
    cta: "Take test",
  },

  featuresTitle: "Everything you need to practise",
  featuresSubtitle: "Simple, focused MCQ practice for your professional exams.",

  features: [
    {
      title: "Exam-style questions",
      text: "Single best answer MCQs written around the topics that come up in professional exams.",
    },
    {
      title: "Instant marking",
      text: "Submit and see your score straight away, with the correct answer shown for every question.",
    },
    {
      title: "Made for your phone",
      text: "Works on any phone or computer, with nothing to install.",
    },
  ],

  footer: {
    title: "Start practising today",
    tagline: "MCQ practice for MBBS students in Bangladesh.",
    cta: "Take test",
  },

  practice: {
    kicker: "Progress",
    title: "Pharmacology",
    subtitle: `${QUESTIONS_PER_TEST} random questions. Choose one answer for each, then submit to see your score.`,
    loading: "Loading questions…",
    empty: "No questions yet. Please check back soon.",
    submit: "Submit answers",
    submitting: "Marking…",
    unansweredNote: "Unanswered questions are marked wrong.",
    error: "Something went wrong. Please try again.",
    tryAgain: "Try another set",
    loadingNew: "Loading…",
  },

  status: {
    correct: "Correct",
    wrong: "Wrong",
    skipped: "Not answered",
    notMarked: "Not marked",
  },
} as const;

/** Short plain summary under the score on the results screen. */
export function scoreSummary(score: number, total: number, answered: number) {
  if (answered === 0) return "You didn't answer any questions.";
  return `You answered ${score} of ${total} questions correctly.`;
}

/** 0–3 stars for the results screen. */
export function starsFor(score: number, total: number) {
  const percent = total ? score / total : 0;
  if (percent >= 0.9) return 3;
  if (percent >= 0.6) return 2;
  if (percent >= 0.3) return 1;
  return 0;
}
