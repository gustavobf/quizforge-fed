import api from './axios'
import type { CreateExamResponse, FinishExamRequest, ExamResultResponse } from '@/types/exam.types'

export const examApi = {
  createExam: (data: { title: string; subjectId?: number; quantity: number }) => {
    return api.post<CreateExamResponse>('/exams', data)
  },

  finishExam: (examId: number, data: FinishExamRequest) => {
    return api.post<ExamResultResponse>(`/exams/${examId}/finish`, data)
  }
}