export interface Alternative {
  alternativeId: number;
  description: string;
}

export interface Question {
  questionId: number;
  statement: string;
  alternatives: Alternative[];
  orderNumber: number;
}

export interface CreateExamResponse {
  examId: number;
  title: string;
  totalQuestions: number;
  subjectName: string | null;
  questions: Question[];
}

export interface FinishExamRequest {
  answers: Record<number, number[]>;
}

export interface ExamResultResponse {
  examId: number;
  title: string;
  subjectName: string | null;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  startedAt: string;
  finishedAt: string;
  timeSpentInMinutes: number;
  questions: {
    number: number;
    statement: string;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    questionType: string;
  }[];
}