import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de resposta para normalizar mensagens de erro
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const status = error.response.status
      const msg = error.response.data?.message || error.response.data?.error || error.message || 'Erro de requisição'
      return Promise.reject(new Error(`[${status}] ${msg}`))
    }
    if (error.request) {
      return Promise.reject(new Error('Sem resposta do servidor'))
    }
    return Promise.reject(new Error(error.message || 'Erro desconhecido'))
  }
)
