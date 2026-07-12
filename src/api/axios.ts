import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      console.error(`API Error ${status}:`, data)

      switch (status) {
        case 400:
          console.error('Bad Request:', data?.message || 'Invalid request')
          break
        case 401:
          console.error('Unauthorized: Please login again')
          break
        case 403:
          console.error('Forbidden: You don\'t have permission')
          break
        case 404:
          console.error('Not Found:', data?.message || 'Resource not found')
          break
        case 422:
          console.error('Validation Error:', data?.errors || data?.message)
          break
        case 500:
          console.error('Internal Server Error')
          break
        default:
          console.error(`Error ${status}:`, data?.message || 'Unknown error')
      }
    } else if (error.request) {
      console.error('No response from server:', error.request)
    } else {
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api