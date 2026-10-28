// What the browser receives before submission. Deliberately has no
// "correct" field anywhere.
export type StudentOption = {
  id: string;
  text: string;
};

export type StudentQuestion = {
  id: string;
  topic: string | null;
  text: string;
  imageUrl: string | null;
  options: StudentOption[];
};

// questionId -> chosen optionId
export type Answers = Record<string, string>;

// What the server sends back after marking.
export type QuestionResult = {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
};

export type TestResult = {
  score: number;
  total: number;
  results: QuestionResult[];
};
