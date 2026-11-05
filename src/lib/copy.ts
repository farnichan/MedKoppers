// All user-facing text in one place, so it's easy to edit without touching
// layout code. Tone: plain, clear and regular for now. No game wording
// (XP, levels, "game over") and no jokes; those may be added later.

import { QUESTIONS_PER_TEST } from "./config";

export const COPY = {
  nav: {
    logIn: "Log in",
    signUp: "Sign up",
  },

  hero: {
    eyebrow: "Pharmacology · more subjects coming soon",
    title: "Ace your prof finals",
    subtitle: `Exam-style Pharmacology questions for MBBS students in Bangladesh. ${QUESTIONS_PER_TEST} random questions at a time, marked instantly.`,
    cta: "Sign up",
    demoCta: "Take demo test",
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

  auth: {
    signupTitle: "Create your account",
    signupSubtitle: "Takes less than a minute.",
    loginTitle: "Log in",
    loginSubtitle: "Welcome back.",

    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    currentPasswordPlaceholder: "Your password",

    signupSubmit: "Create account",
    signupSubmitting: "Creating account…",
    loginSubmit: "Continue",
    loginSubmitting: "Checking…",

    codeLabel: "6-digit code",
    codePlaceholder: "000000",
    verifySubmit: "Verify and continue",
    verifySubmitting: "Verifying…",
    changeEmail: "Use a different email",
    resend: "Resend code",
    resendSent: "Code sent.",
    resendIn: (seconds: number) => `Resend code (${seconds}s)`,

    existingAccountLogin: "You already have an account, so we're logging you in.",
    existingAccount: "An account with that email already exists. Log in instead.",

    forgotLink: "Forgot password?",
    forgotTitle: "Reset your password",
    forgotSubtitle: "Enter your account email and we'll send you a 6-digit code.",
    forgotSubmit: "Send code",
    forgotSubmitting: "Sending…",
    resetCodeSentTo: (email: string) =>
      `If ${email} has an account, we've sent a 6-digit code to it. Enter it below with your new password.`,
    resetNoCodeDev: "Local dev: no code needed. Choose your new password.",
    newPasswordLabel: "New password",
    resetSubmit: "Reset password",
    resetSubmitting: "Resetting…",
    passwordReused: "Choose a password you haven't used before.",
    noAccountDev: "No account with that email.",
    backToLogin: "Back to log in",

    hasAccount: "Already have an account?",
    noAccount: "Don't have an account?",
  },

  home: {
    loading: "Loading…",
    logOut: "Log out",
  },

  // Pages for signed-in students.
  app: {
    nav: {
      dashboard: "Dashboard",
      history: "History",
      newTest: "New test",
      subjects: "Subjects",
      pharmacology: "Pharmacology",
      comingSoon: "More subjects soon",
      menu: "Menu",
      closeMenu: "Close menu",
      account: "Account",
    },
    dashboard: {
      title: "Dashboard",
      testsTaken: "Tests taken",
      average: "Average score",
      best: "Best score",
      questionsAnswered: "Questions answered",
      lastNote: (date: string) => `Last: ${date}`,
      lastFiveNote: (percent: number) => `Last 5: ${percent}%`,
      correctNote: (n: number) => `${n} correct`,
      chartTitle: "Score history",
      chartSubtitle: (n: number) => `Your last ${n} ${n === 1 ? "test" : "tests"}`,
      topicsTitle: "Topics",
      topicsSubtitle: "Your accuracy per topic, weakest first",
      otherTopic: "Other",
      recentTitle: "Recent tests",
      viewAll: "View all",
      emptyTitle: "No tests yet",
      emptyText: "Your scores, history and progress will show up here after your first test.",
      emptyCta: "Take your first test",
    },
    history: {
      title: "History",
      subtitle: (n: number) => `${n} ${n === 1 ? "test" : "tests"} taken`,
    },
    table: {
      test: "Test",
      date: "Date",
      score: "Score",
      accuracy: "Accuracy",
    },
    test: {
      exit: "Exit",
      title: "Pharmacology test",
      saved: "Saved to your dashboard.",
      notSaved: "Your answers were marked, but we couldn't save this result.",
      toDashboard: "Back to dashboard",
    },
    results: {
      title: "Test review",
      filters: { all: "All", wrong: "Wrong", skipped: "Not answered", correct: "Correct" },
      noneInFilter: "No questions here.",
      missingQuestion: "This question has since been removed from the bank.",
    },
  },
} as const;

/** A code was emailed to this address; shown on the OTP step of sign up/login. */
export function codeSentTo(email: string) {
  return `We've sent a 6-digit code to ${email}.`;
}

/** Turns a raw Supabase Auth error message into something a student can act on. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) {
    return "Please verify your email first. Check your inbox for the code, or sign up again to get a new one.";
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    return "An account with that email already exists. Try logging in instead.";
  }
  if (m.includes("password")) return "Password must be at least 8 characters.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (m.includes("rate limit") || m.includes("security purposes") || m.includes("too many")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (m.includes("token") || m.includes("otp") || m.includes("code")) {
    return "That code is incorrect or has expired. Request a new one.";
  }
  return "Something went wrong. Please try again.";
}

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

/** e.g. "6 Nov 2026", in Bangladesh time. */
export function formatDay(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(iso));
}

/** "Welcome back, Nusrat" (first name only). */
export function welcomeBack(name: string) {
  const first = name.trim().split(/\s+/)[0];
  return first ? `Welcome back, ${first}` : "Welcome back";
}

/** e.g. "6 Nov 2026, 3:45 pm", in Bangladesh time. */
export function formatTestDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).format(new Date(iso));
}

/** Whole-number percentage, e.g. 7 of 10 -> 70. */
export function percentOf(score: number, total: number) {
  return total ? Math.round((score / total) * 100) : 0;
}

/** "Test #12" */
export function testLabel(number: number) {
  return `Test #${number}`;
}

/** Up to two initials for an avatar, e.g. "Farhin Husain" -> "FH". */
export function initialsOf(name: string, email: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) return words.slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
  return (email[0] ?? "?").toUpperCase();
}
