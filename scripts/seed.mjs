// Seeds dummy Pharmacology MCQs (and their images) into Supabase.
//
// Run with:  npm run seed
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
// Safe to run more than once: questions whose text already exists are skipped.

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const SUBJECT_SLUG = "pharmacology";
const BUCKET = "question-images";
const IMAGE_DIR = new URL("../supabase/seed-images/", import.meta.url);

// `correct` is the 0-based index of the right option.
const QUESTIONS = [
  // --- General pharmacology ---
  {
    topic: "General pharmacology",
    text: "Which cytochrome P450 isoenzyme metabolises the largest proportion of clinically used drugs?",
    options: ["CYP1A2", "CYP2C9", "CYP2D6", "CYP3A4", "CYP2E1"],
    correct: 3,
  },
  {
    topic: "General pharmacology",
    text: "Which of the following drugs shows zero-order (saturation) kinetics within or just above its therapeutic range?",
    options: ["Amoxicillin", "Phenytoin", "Metformin", "Paracetamol", "Atenolol"],
    correct: 1,
  },
  {
    topic: "General pharmacology",
    text: "The therapeutic index of a drug is best defined as:",
    options: ["ED50 / TD50", "TD50 / ED50", "ED50 × TD50", "LD50 − ED50", "Peak concentration / trough concentration"],
    correct: 1,
  },
  {
    topic: "General pharmacology",
    text: "The graph shows the log dose–response curve of an agonist alone (A) and in the presence of a second drug (B). Drug B is most likely a:",
    image: "dose-response.png",
    options: ["Competitive (surmountable) antagonist", "Non-competitive antagonist", "Partial agonist", "Inverse agonist", "Physiological antagonist"],
    correct: 0,
  },
  {
    topic: "General pharmacology",
    text: "In the plasma concentration–time graph, the shaded region marked X represents the:",
    image: "plasma-concentration.png",
    options: ["Duration of action", "Therapeutic window", "Time to peak concentration", "Elimination half-life", "Loading dose"],
    correct: 1,
  },
  // --- Autonomic nervous system ---
  {
    topic: "Autonomic nervous system",
    text: "What is the drug of choice for the immediate treatment of anaphylactic shock?",
    options: ["IV hydrocortisone", "IM adrenaline", "IV chlorpheniramine", "Nebulised salbutamol", "IV atropine"],
    correct: 1,
  },
  {
    topic: "Autonomic nervous system",
    text: "Which drug reactivates acetylcholinesterase in organophosphate poisoning?",
    options: ["Atropine", "Physostigmine", "Pralidoxime", "Neostigmine", "Naloxone"],
    correct: 2,
  },
  {
    topic: "Autonomic nervous system",
    text: "Which of the following is a non-selective β-adrenoceptor blocker?",
    options: ["Atenolol", "Metoprolol", "Bisoprolol", "Propranolol", "Esmolol"],
    correct: 3,
  },
  // --- Cardiovascular & renal ---
  {
    topic: "Cardiovascular & renal",
    text: "A persistent dry cough with an ACE inhibitor is caused by accumulation of:",
    options: ["Angiotensin II", "Bradykinin", "Histamine", "Aldosterone", "Renin"],
    correct: 1,
  },
  {
    topic: "Cardiovascular & renal",
    text: "Digoxin increases myocardial contractility primarily by inhibiting:",
    options: ["β1-adrenoceptors", "L-type calcium channels", "Na⁺/K⁺-ATPase", "Phosphodiesterase-3", "Funny (If) channels"],
    correct: 2,
  },
  {
    topic: "Cardiovascular & renal",
    text: "In the diagram of the nephron, furosemide acts mainly at the segment labelled:",
    image: "nephron.png",
    options: ["A", "B", "C", "D"],
    correct: 1,
  },
  {
    topic: "Cardiovascular & renal",
    text: "Statins lower plasma LDL cholesterol by inhibiting:",
    options: ["Lipoprotein lipase", "HMG-CoA reductase", "NPC1L1 transporter", "PCSK9", "Cholesteryl ester transfer protein"],
    correct: 1,
  },
  // --- Antimicrobials ---
  {
    topic: "Antimicrobials",
    text: "Which of the following antibiotics acts by inhibiting bacterial cell wall synthesis?",
    options: ["Tetracycline", "Ciprofloxacin", "Gentamicin", "Benzylpenicillin", "Erythromycin"],
    correct: 3,
  },
  {
    topic: "Antimicrobials",
    text: "Ciprofloxacin exerts its antibacterial effect by inhibiting:",
    options: ["DNA gyrase (topoisomerase II)", "The 30S ribosomal subunit", "Dihydrofolate reductase", "Transpeptidase", "RNA polymerase"],
    correct: 0,
  },
  {
    topic: "Antimicrobials",
    text: "Orange-red discolouration of urine and tears is characteristic of which antitubercular drug?",
    options: ["Isoniazid", "Ethambutol", "Pyrazinamide", "Rifampicin", "Streptomycin"],
    correct: 3,
  },
  {
    topic: "Antimicrobials",
    text: "A patient started on co-trimoxazole a week ago develops fever, mucosal ulceration and the skin lesions shown. The most likely diagnosis is:",
    image: "skin-lesion-placeholder.png",
    options: ["Fixed drug eruption", "Stevens–Johnson syndrome", "Urticaria", "Photosensitivity reaction", "Contact dermatitis"],
    correct: 1,
  },
  // --- Central nervous system ---
  {
    topic: "Central nervous system",
    text: "Which drug is used to reverse benzodiazepine overdose?",
    options: ["Naloxone", "Flumazenil", "Physostigmine", "N-acetylcysteine", "Atropine"],
    correct: 1,
  },
  {
    topic: "Central nervous system",
    text: "Carbidopa is combined with levodopa because carbidopa:",
    options: [
      "Is a dopamine receptor agonist",
      "Inhibits peripheral dopa decarboxylase",
      "Inhibits MAO-B in the brain",
      "Inhibits COMT in the brain",
      "Increases dopamine release from nerve terminals",
    ],
    correct: 1,
  },
  // --- Endocrine ---
  {
    topic: "Endocrine",
    text: "Which serious adverse effect is associated with metformin, especially in renal impairment?",
    options: ["Hypoglycaemia", "Lactic acidosis", "Weight gain", "Agranulocytosis", "Hepatic necrosis"],
    correct: 1,
  },
  {
    topic: "Endocrine",
    text: "Which antithyroid drug is preferred during the first trimester of pregnancy?",
    options: ["Carbimazole", "Methimazole", "Propylthiouracil", "Radioactive iodine", "Potassium perchlorate"],
    correct: 2,
  },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Fill in .env.local first (see .env.example).`);
    process.exit(1);
  }
  return value;
}

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SECRET_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function main() {
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

  let added = 0;
  for (const [index, q] of QUESTIONS.entries()) {
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
      const file = await readFile(new URL(q.image, IMAGE_DIR));
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(imagePath, file, { contentType: "image/png", upsert: true });
      if (error) throw new Error(`Image upload failed for ${q.image}: ${error.message}`);
    }

    // Stagger created_at so questions keep the order they have in this file.
    const createdAt = new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString();

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
    if (qError) throw new Error(`Insert question failed: ${qError.message}`);

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
      if (oError) throw new Error(`Insert options failed: ${oError.message}`);

      const correct = options.find((o) => o.position === q.correct + 1);
      const { error: kError } = await supabase
        .from("answer_keys")
        .insert({ question_id: question.id, correct_option_id: correct.id });
      if (kError) throw new Error(`Insert answer key failed: ${kError.message}`);
    } catch (err) {
      // Don't leave a half-created question behind.
      await supabase.from("questions").delete().eq("id", question.id);
      throw err;
    }

    added++;
  }

  console.log(`Done. Added ${added} new question(s); ${QUESTIONS.length - added} already existed.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
