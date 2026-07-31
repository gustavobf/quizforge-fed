import http from './http'
import type { CreateExamResponse, FinishExamRequest, ExamResultResponse } from '@/types/exam.types'

export const examService = {
  createExam: (data: { title: string; subjectId?: number; quantity: number }) =>
    http.post<CreateExamResponse>('/exams', data),

  finishExam: (examId: number, data: FinishExamRequest) =>
    http.post<ExamResultResponse>(`/exams/${examId}/finish`, data),
}
