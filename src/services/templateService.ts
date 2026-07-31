import http from './http'

export const templateService = {
  downloadTemplate: () =>
    http.get('/template', { responseType: 'blob' }),
}
