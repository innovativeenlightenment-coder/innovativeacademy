export type PracticeTestAnswer = {
  id: string;
  ans: string;
  selected: string;
};

export type PracticeTestQuestion = {
  _id: string;

  questionType: "text" | "image";
  optionType: "text" | "image";

  question: {
    text?: string;
    imgUrl?: string;
  };

  options: {
    text?: string;
    imgUrl?: string;
  }[];

  answer: "A" | "B" | "C" | "D";

  level:
    | "Easy"
    | "Medium"
    | "Difficult"
    | "Moderate"
    | "Very Easy"
    | "Extreme"
    | "Excellent";

  course: string;
  subject: string;
  chapter: string;

  hintType?: "text" | "image";

  hint?: {
    text?: string;
    imgUrl?: string;
  };
};

export type PracticeTestResult = {
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  percentage: number;

  Answers: PracticeTestAnswer[];
};

export type PracticeTestDetails = {
  course: string;
  subject?: string;
  chapter?: string;

  timeLeft: number;
  duration: number;

  questionIds: string[];

  date: string;

  totalMarks: number;
  testType: string;
};

export type InstantResult = {
  result: PracticeTestResult;

  questions: PracticeTestQuestion[];

  submittedAnswers: Record<string, string>;

  testDetails: PracticeTestDetails;
};