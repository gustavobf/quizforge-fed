import apiClient from './axios'

export interface Subject {
  id: number
  name: string
  description: string | null
}

export interface CreateSubjectRequest {
  name: string
  description?: string
}

export const subjectApi = {
  getAll: () =>
    apiClient.get<Subject[]>('/subjects'),

  create: (data: CreateSubjectRequest) =>
    apiClient.post<Subject>('/subjects', data),

  getById: (id: number) =>
    apiClient.get<Subject>(`/subjects/${id}`),

  update: (id: number, data: CreateSubjectRequest) =>
    apiClient.put<Subject>(`/subjects/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/subjects/${id}`)
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400 && error.response?.data?.validationErrors) {
      return Promise.reject(error)
    }
    return Promise.reject(error)
  }
)

export default apiClient