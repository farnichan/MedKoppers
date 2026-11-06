// Imports MCQs from a CSV file (plus an optional folder of images) into Supabase.
//
// Run with:  npm run import -- path/to/questions.csv [path/to/images/]
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
//
// CSV columns: topic, question, A, B, … up to J, answer (a letter), image (file name, optional).
// Every row is checked first; if any row has a problem, nothing is imported.
// Safe to run more than once: questions whose text already exists are skipped.

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUBJECT_SLUG = "pharmacology";
const BUCKET = "question-images";
const LETTERS = "ABCDEFGHIJ".split("");
const IMAGE_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const [csvPath, imageDir] = process.argv.slice(2);
if (!csvPath) {
  console.error("Usage: npm run import -- path/to/questions.csv [path/to/images/]");
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Fill in .env.local first (see .env.example).`);
    process.exit(1);
  }
  return value;
}

// Small CSV parser: handles quoted fields, "" escapes and line breaks inside quotes.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim()));
}

async function readQuestions() {
  const text = (await readFile(csvPath, "utf8")).replace(/^﻿/, "");
  const [header, ...rows] = parseCsv(text);
  const col = Object.fromEntries(header.map((h, i) => [h.trim().toLowerCase(), i]));
  for (const required of ["question", "a", "b", "answer"]) {
    if (!(required in col)) throw new Error(`The CSV has no '${required}' column.`);
  }
  const get = (row, name) => (name in col ? (row[col[name]] ?? "").trim() : "");

  const questions = [];
  const problems = [];
  for (const [i, row] of rows.entries()) {
    const line = i + 2; // spreadsheet row number (row 1 is the header)
    const options = LETTERS.map((l) => get(row, l.toLowerCase()));
    const lastFilled = options.findLastIndex((o) => o);
    const filled = options.slice(0, lastFilled + 1);
    const answer = get(row, "answer").toUpperCase();
    const q = {
      line,
      topic: get(row, "topic") || null,
      text: get(row, "question"),
      options: filled,
      correct: LETTERS.indexOf(answer),
      image: get(row, "image") || null,
    };

    if (!q.text) problems.push(`Row ${line}: the question is empty.`);
    if (filled.length < 2) problems.push(`Row ${line}: needs at least 2 options.`);
    if (filled.some((o) => !o)) problems.push(`Row ${line}: there's a gap in the options (fill them from A with none empty).`);
    if (q.correct === -1 || answer.length !== 1) problems.push(`Row ${line}: the answer must be one letter, A to J.`);
    else if (!filled[q.correct]) problems.push(`Row ${line}: the answer (${answer}) points to an empty option.`);
    if (q.image) {
      const type = IMAGE_TYPES[path.extname(q.image).toLowerCase()];
      if (!type) problems.push(`Row ${line}: image ${q.image} must be PNG, JPG or WebP.`);
      else if (!imageDir) problems.push(`Row ${line}: uses image ${q.image}, but no images folder was given.`);
      else {
        const size = await stat(path.join(imageDir, q.image)).then((s) => s.size, () => null);
        if (size === null) problems.push(`Row ${line}: image ${q.image} isn't in ${imageDir}.`);
        else if (size > MAX_IMAGE_BYTES) problems.push(`Row ${line}: image ${q.image} is over 2 MB.`);
      }
      q.contentType = type;
    }
    questions.push(q);
  }

  const seen = new Map();
  for (const q of questions) {
    if (seen.has(q.text)) problems.push(`Row ${q.line}: same question text as row ${seen.get(q.text)}.`);
    else seen.set(q.text, q.line);
  }

  if (problems.length) {
    throw new Error(`Nothing was imported. Fix these first:\n  ${problems.join("\n  ")}`);
  }
  return questions;
}

async function main() {
  const questions = await readQuestions();

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", SUBJECT_SLUG)
    .single();
  if (subjectError) {
    throw new Error(
      `Could not find the '${SUBJECT_SLUG}' subject. Have the migrations been applied? (${subjectError.message})`,
    );
  }

  const uploaded = new Set();
  const start = Date.now();
  let added = 0;
  for (const [index, q] of questions.entries()) {
    const { data: existing } = await supabase
      .from("questions")
      .select("id")
      .eq("subject_id", subject.id)
      .eq("question_text", q.text)
      .maybeSingle();
    if (existing) continue;

    let imagePath = null;
    if (q.image) {
      imagePath = `${SUBJECT_SLUG}/${q.image}`;
      if (!uploaded.has(q.image)) {
        const file = await readFile(path.join(imageDir, q.image));
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(imagePath, file, { contentType: q.contentType, upsert: true });
        if (error) throw new Error(`Image upload failed for ${q.image}: ${error.message}`);
        uploaded.add(q.image);
      }
    }

    // Stagger created_at so questions keep the order they have in the CSV.
    const createdAt = new Date(start + index * 1000).toISOString();

    const { data: question, error: qError } = await supabase
      .from("questions")
      .insert({
        subject_id: subject.id,
        topic: q.topic,
        question_text: q.text,
        image_path: imagePath,
        created_at: createdAt,
        updated_at: createdAt,
      })
      .select("id")
      .single();
    if (qError) throw new Error(`Row ${q.line}: insert question failed: ${qError.message}`);

    try {
      const { data: options, error: oError } = await supabase
        .from("options")
        .insert(
          q.options.map((text, i) => ({
            question_id: question.id,
            option_text: text,
            position: i + 1,
          })),
        )
        .select("id, position");
      if (oError) throw new Error(`insert options failed: ${oError.message}`);

      const correct = options.find((o) => o.position === q.correct + 1);
      const { error: kError } = await supabase
        .from("answer_keys")
        .insert({ question_id: question.id, correct_option_id: correct.id });
      if (kError) throw new Error(`insert answer key failed: ${kError.message}`);
    } catch (err) {
      // Don't leave a half-created question behind.
      await supabase.from("questions").delete().eq("id", question.id);
      throw new Error(`Row ${q.line}: ${err.message}`);
    }

    added++;
    if (added % 50 === 0) console.log(`  …${added} added`);
  }

  console.log(`Done. Added ${added} new question(s); ${questions.length - added} already existed.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
