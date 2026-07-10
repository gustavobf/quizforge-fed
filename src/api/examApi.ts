import apiClient from './client'

export interface CreateExamRequest {
  title: string
  description?: string
  subjectId?: number
  quantity: number
}

export interface ExamResponse {
  examId: number
  title: string
  totalQuestions: number
  subjectName: string | null
  status: string
}

export interface ExamQuestionResponse {
  examId: number
  totalQuestions: number
  currentQuestionNumber: number
  statement: string
  subjectName: string | null
  alternatives: AlternativeDto[]
  isAnswered: boolean
  selectedAlternativeId: number | null
}

export interface AlternativeDto {
  id: number
  statement: string
}

export interface ExamResultResponse {
  examId: number
  title: string
  subjectName: string | null
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  status: string
  startedAt: string
  finishedAt: string
  timeSpentInMinutes: number
  questions: QuestionResultDto[]
}

export interface QuestionResultDto {
  number: number
  statement: string
  yourAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export const examApi = {
  create: (data: CreateExamRequest) =>
    apiClient.post<ExamResponse>('/exams', data),

  getCurrentQuestion: (examId: number) =>
    apiClient.get<ExamQuestionResponse>(`/exams/${examId}/questions/current`),

  answerQuestion: (examId: number, alternativeId: number) =>
    apiClient.post(`/exams/${examId}/questions/answer`, { alternativeId }),

  finishExam: (examId: number) =>
    apiClient.post<ExamResultResponse>(`/exams/${examId}/finish`)
}