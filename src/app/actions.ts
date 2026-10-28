"use server";

import { TEST_SUBJECT_SLUG } from "@/lib/config";
import { gradeTest, parseAnswers } from "@/lib/grading";
import type { TestResult } from "@/lib/types";

/**
 * Called from the browser when the student taps Submit.
 * All marking happens here on the server; the browser only ever learns
 * the correct answers after it has submitted.
 */
export async function submitTest(answers: unknown): Promise<TestResult> {
  return gradeTest(TEST_SUBJECT_SLUG, parseAnswers(answers));
}
