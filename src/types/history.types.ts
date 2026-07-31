export interface HistorySummary {
  totalExams: number
  totalQuestionsAnswered: number
  averageScore: number
  bestScore: number
  worstScore: number
  recentExams: {
    id: number
    title: string
    subjectName: string | null
    score: number
    correctAnswers: number
    totalQuestions: number
    finishedAt: string
  }[]
}

export interface HistoryExam {
  examId: number
  title: string
  subjectName: string | null
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  startedAt: string
  finishedAt: string
  timeSpentInMinutes: number
}

export interface HistoryExamDetail extends HistoryExam {
  questions: {
    number: number
    questionId: number
    statement: string
    alternatives: {
      alternativeId: number
      description: string
      isCorrect: boolean
    }[]
    yourAnswer: string[]
    correctAnswer: string[]
    isCorrect: boolean
    questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
  }[]
}

export interface SubjectStats {
  subjectId: number
  subjectName: string
  totalExams: number
  totalQuestions: number
  correctAnswers: number
  averageScore: number
  bestScore: number
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    totalPages: number
    totalElements: number
  }
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
