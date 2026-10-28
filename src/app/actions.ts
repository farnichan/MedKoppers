"use server";

import { QUESTIONS_PER_TEST, TEST_SUBJECT_SLUG } from "@/lib/config";
import { gradeTest, parseAnswers, parseQuestionIds } from "@/lib/grading";
import { drawRandomQuestions } from "@/lib/questions";
import type { StudentQuestion, TestResult } from "@/lib/types";

/**
 * Called from the browser when the student taps Submit, with the IDs of the
 * questions they were shown and their chosen options.
 * All marking happens here on the server; the browser only ever learns
 * the correct answers after it has submitted.
 */
export async function submitTest(
  questionIds: unknown,
  answers: unknown,
): Promise<TestResult> {
  return gradeTest(TEST_SUBJECT_SLUG, parseQuestionIds(questionIds), parseAnswers(answers));
}

/** A fresh random set of questions (no answers), for "Try again". */
export async function drawNewQuestions(): Promise<StudentQuestion[]> {
  return drawRandomQuestions(TEST_SUBJECT_SLUG, QUESTIONS_PER_TEST);
}
