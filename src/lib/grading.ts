import "server-only";
import { createAdminClient } from "./supabase/admin";
import type { Answers, TestResult } from "./types";

// Generous upper bound on questions in one attempt, to reject junk input.
const MAX_QUESTIONS = 50;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_RE.test(value);

/** Rejects anything that isn't a plain { questionId: optionId } object of UUIDs. */
export function parseAnswers(input: unknown): Answers {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Invalid answers");
  }
  const entries = Object.entries(input);
  if (entries.length > MAX_QUESTIONS) throw new Error("Invalid answers");

  const answers: Answers = {};
  for (const [questionId, optionId] of entries) {
    if (!isUuid(questionId) || !isUuid(optionId)) throw new Error("Invalid answers");
    answers[questionId] = optionId;
  }
  return answers;
}

/** Rejects anything that isn't a short list of distinct question UUIDs. */
export function parseQuestionIds(input: unknown): string[] {
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.length > MAX_QUESTIONS ||
    !input.every(isUuid) ||
    new Set(input).size !== input.length
  ) {
    throw new Error("Invalid question list");
  }
  return input;
}

/**
 * Marks a student's answers for the questions they were shown.
 * Unanswered questions count as wrong. Runs on the server only.
 */
export async function gradeTest(
  subjectSlug: string,
  questionIds: string[],
  answers: Answers,
): Promise<TestResult> {
  const supabase = createAdminClient();

  // Fetch the answer keys for the shown questions. Only questions that really
  // exist in this subject count, so the total comes from the database.
  const { data, error } = await supabase
    .from("questions")
    .select("id, subjects!inner(slug), answer_keys(correct_option_id)")
    .eq("subjects.slug", subjectSlug)
    .in("id", questionIds);

  if (error) {
    throw new Error(`Could not load answer keys: ${error.message}`);
  }

  const results = data.flatMap((q) => {
    // answer_keys is one-to-one with questions, so PostgREST returns an object.
    const key = q.answer_keys as unknown as { correct_option_id: string } | null;
    if (!key) {
      // A question without an answer key can't be marked; leave it out
      // rather than count it against the student.
      console.warn(`Question ${q.id} has no answer key; skipped in marking.`);
      return [];
    }
    const selectedOptionId = answers[q.id] ?? null;
    return [
      {
        questionId: q.id,
        selectedOptionId,
        correctOptionId: key.correct_option_id,
        isCorrect: selectedOptionId === key.correct_option_id,
      },
    ];
  });

  return {
    score: results.filter((r) => r.isCorrect).length,
    total: results.length,
    results,
  };
}
