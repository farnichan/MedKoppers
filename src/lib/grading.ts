import "server-only";
import { createAdminClient } from "./supabase/admin";
import type { Answers, TestResult } from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rejects anything that isn't a plain { questionId: optionId } object of UUIDs. */
export function parseAnswers(input: unknown): Answers {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Invalid answers");
  }
  const entries = Object.entries(input);
  if (entries.length > 500) throw new Error("Invalid answers");

  const answers: Answers = {};
  for (const [questionId, optionId] of entries) {
    if (!UUID_RE.test(questionId) || typeof optionId !== "string" || !UUID_RE.test(optionId)) {
      throw new Error("Invalid answers");
    }
    answers[questionId] = optionId;
  }
  return answers;
}

/**
 * Marks a student's answers against every question in the subject.
 * Unanswered questions count as wrong. Runs on the server only.
 */
export async function gradeTest(
  subjectSlug: string,
  answers: Answers,
): Promise<TestResult> {
  const supabase = createAdminClient();

  // Fetch the answer key for every question in this subject. The total is
  // based on the database, not on what the browser sent.
  const { data, error } = await supabase
    .from("questions")
    .select("id, subjects!inner(slug), answer_keys(correct_option_id)")
    .eq("subjects.slug", subjectSlug);

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
