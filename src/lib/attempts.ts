import "server-only";
import { isUuid } from "./grading";
import { createAdminClient } from "./supabase/admin";
import { createServerClient } from "./supabase/server";
import type { QuestionResult, TestResult } from "./types";

// Saved test results for signed-in students (tables: test_attempts,
// attempt_answers). Writes use the secret key, because students have no
// write access at all; reads use the student's own session, so Row Level
// Security guarantees they only ever see their own results.

export type AttemptSummary = {
  id: string;
  /** 1 = the student's first test, counting up. */
  number: number;
  score: number;
  total: number;
  createdAt: string;
};

export type AttemptDetail = AttemptSummary & {
  /** In the order the questions were shown. */
  answers: QuestionResult[];
};

/**
 * Saves a marked test. `userId` must come from the verified session
 * (getCurrentUser), never from the browser. `questionIds` is the order the
 * questions were shown in.
 */
export async function saveAttempt(
  userId: string,
  subjectSlug: string,
  questionIds: string[],
  result: TestResult,
): Promise<string> {
  if (result.total === 0) throw new Error("Nothing to save");
  const supabase = createAdminClient();

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", subjectSlug)
    .single();
  if (subjectError) throw new Error(`Could not find subject: ${subjectError.message}`);

  const { data: attempt, error: attemptError } = await supabase
    .from("test_attempts")
    .insert({ user_id: userId, subject_id: subject.id, score: result.score, total: result.total })
    .select("id")
    .single();
  if (attemptError) throw new Error(`Could not save attempt: ${attemptError.message}`);

  const { error: answersError } = await supabase.from("attempt_answers").insert(
    result.results.map((r) => ({
      attempt_id: attempt.id,
      question_id: r.questionId,
      position: questionIds.indexOf(r.questionId) + 1,
      selected_option_id: r.selectedOptionId,
      correct_option_id: r.correctOptionId,
      is_correct: r.isCorrect,
    })),
  );
  if (answersError) {
    // Don't leave a half-saved attempt behind.
    await supabase.from("test_attempts").delete().eq("id", attempt.id);
    throw new Error(`Could not save answers: ${answersError.message}`);
  }

  return attempt.id;
}

/**
 * The signed-in student's most recent tests (newest first), plus how many
 * tests they've taken in total.
 */
export async function getMyAttempts(
  limit = 200,
): Promise<{ attempts: AttemptSummary[]; totalCount: number }> {
  const supabase = await createServerClient();
  const { data, count, error } = await supabase
    .from("test_attempts")
    .select("id, score, total, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load your tests: ${error.message}`);

  const totalCount = count ?? data.length;
  return {
    totalCount,
    attempts: data.map((a, i) => ({
      id: a.id,
      number: totalCount - i,
      score: a.score,
      total: a.total,
      createdAt: a.created_at,
    })),
  };
}

export type TopicStat = { topic: string | null; correct: number; total: number };

/**
 * Accuracy per question topic across all of the signed-in student's tests,
 * weakest first (ties: most-answered first). topic null = untagged questions.
 */
export async function getMyTopicStats(): Promise<TopicStat[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("attempt_answers")
    .select("is_correct, questions(topic)")
    .limit(10000);
  if (error) throw new Error(`Could not load topic stats: ${error.message}`);

  const byTopic = new Map<string | null, TopicStat>();
  for (const row of data) {
    // questions is one-to-one here, so PostgREST returns an object.
    const topic = (row.questions as unknown as { topic: string | null } | null)?.topic ?? null;
    const stat = byTopic.get(topic) ?? { topic, correct: 0, total: 0 };
    stat.total += 1;
    if (row.is_correct) stat.correct += 1;
    byTopic.set(topic, stat);
  }
  return [...byTopic.values()].sort(
    (a, b) => a.correct / a.total - b.correct / b.total || b.total - a.total,
  );
}

/** One of the signed-in student's tests with every answer, or null if it isn't theirs. */
export async function getMyAttempt(id: string): Promise<AttemptDetail | null> {
  if (!isUuid(id)) return null;
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("test_attempts")
    .select(
      "id, score, total, created_at, attempt_answers(question_id, position, selected_option_id, correct_option_id, is_correct)",
    )
    .eq("id", id)
    .order("position", { referencedTable: "attempt_answers", ascending: true })
    .maybeSingle();
  if (error) throw new Error(`Could not load this test: ${error.message}`);
  if (!data) return null;

  // Its number = how many of the student's tests are this old or older.
  const { count } = await supabase
    .from("test_attempts")
    .select("id", { count: "exact", head: true })
    .lte("created_at", data.created_at);

  return {
    id: data.id,
    number: count ?? 1,
    score: data.score,
    total: data.total,
    createdAt: data.created_at,
    answers: data.attempt_answers.map((a) => ({
      questionId: a.question_id,
      selectedOptionId: a.selected_option_id,
      correctOptionId: a.correct_option_id,
      isCorrect: a.is_correct,
    })),
  };
}
