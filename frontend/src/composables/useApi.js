import { ref } from 'vue'

const API_URL = '/api'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const fetchData = async (endpoint, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición')
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadFile = async (endpoint, formData, method = 'POST', headers = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: method,
        body: formData,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en la subida')
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchData,
    uploadFile
  }
}
