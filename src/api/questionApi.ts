import api from './axios'

export interface ImportQuestionsResponse {
  totalQuestionsImported: number
}

export const questionApi = {

  importQuestions: (file: File, subjectId: number) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post<ImportQuestionsResponse>('/questions/import', formData, {
      params: { subjectId },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}