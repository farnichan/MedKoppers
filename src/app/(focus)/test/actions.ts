"use server";

import { saveAttempt } from "@/lib/attempts";
import { getCurrentUser } from "@/lib/auth";
import { TEST_SUBJECT_SLUG } from "@/lib/config";
import { gradeTest, parseAnswers, parseQuestionIds } from "@/lib/grading";
import type { TestResult } from "@/lib/types";

/**
 * Like submitTest (the public demo), but for a signed-in student: marks the
 * test on the server and saves the result to their dashboard. The user id
 * comes from the verified session, never from the browser.
 */
export async function submitAndSaveTest(questionIds: unknown, answers: unknown): Promise<TestResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const ids = parseQuestionIds(questionIds);
  const result = await gradeTest(TEST_SUBJECT_SLUG, ids, parseAnswers(answers));

  try {
    const attemptId = await saveAttempt(user.id, TEST_SUBJECT_SLUG, ids, result);
    return { ...result, attemptId };
  } catch (error) {
    // Still show the marks even if saving failed.
    console.error(error);
    return { ...result, saveFailed: true };
  }
}
