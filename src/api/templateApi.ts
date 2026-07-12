import api from './axios'

export const templateApi = {
  downloadTemplate: async () => {
    const response = await api.get('/template', {
      responseType: 'blob'
    })
    return response
  }
}