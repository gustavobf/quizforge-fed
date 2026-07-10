import apiClient from './client'

export interface Subject {
  id: number
  name: string
  description: string
}

export const subjectApi = {
  getAll: () =>
    apiClient.get<Subject[]>('/subjects')
}