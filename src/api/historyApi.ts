import apiClient from './client'

export interface ExamHistory {
  id: number
  title: string
  subjectName: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  status: string
  startedAt: string
  finishedAt: string
  timeSpentInMinutes: number
}

export interface ExamHistorySummary {
  totalExams: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  averageScore: number
  bestScore: number
  worstScore: number
  recentExams: ExamHistory[]
}

export const historyApi = {
  getHistory: (page: number = 0, size: number = 20) =>
    apiClient.get<ExamHistory[]>(`/history?page=${page}&size=${size}`),

  getSummary: () =>
    apiClient.get<ExamHistorySummary>('/history/summary'),

  getBySubject: (subjectId: number) =>
    apiClient.get<ExamHistory[]>(`/history/subject/${subjectId}`),

  getById: (examId: number) =>
    apiClient.get<ExamHistory>(`/history/${examId}`)
}