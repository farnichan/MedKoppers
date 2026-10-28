import "server-only";
import { cacheLife } from "next/cache";
import { QUESTION_IMAGES_BUCKET } from "./config";
import { createPublicClient } from "./supabase/public";
import type { StudentQuestion } from "./types";

/**
 * Picks `count` random questions from the subject's bank. Call per request
 * (not cached) so every attempt gets a fresh set.
 */
export async function drawRandomQuestions(
  subjectSlug: string,
  count: number,
): Promise<StudentQuestion[]> {
  const bank = await getQuestionBank(subjectSlug);
  // Fisher–Yates shuffle on a copy, then take the first `count`.
  const shuffled = [...bank];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/**
 * Loads every question in a subject, with options, for display.
 * Never selects anything about correct answers (and the public key
 * couldn't read answer_keys anyway).
 *
 * Cached for a few minutes so the page is fast; edits made in the
 * Supabase dashboard show up after the cache refreshes.
 */
export async function getQuestionBank(
  subjectSlug: string,
): Promise<StudentQuestion[]> {
  "use cache";
  cacheLife("minutes");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, topic, question_text, image_path, subjects!inner(slug), options(id, option_text, position)",
    )
    .eq("subjects.slug", subjectSlug)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .order("position", { referencedTable: "options", ascending: true });

  if (error) {
    throw new Error(`Could not load questions: ${error.message}`);
  }

  return data.map((q) => ({
    id: q.id,
    topic: q.topic,
    text: q.question_text,
    imageUrl: q.image_path
      ? supabase.storage.from(QUESTION_IMAGES_BUCKET).getPublicUrl(q.image_path)
          .data.publicUrl
      : null,
    options: q.options.map((o) => ({ id: o.id, text: o.option_text })),
  }));
}
