import apiService from './apiClient'

const alertService = {
  async getNew(since) {
    const url = since ? `/api/alerts/?since=${since}` : '/api/alerts/'
    return apiService.get(url)
  },
}

export default alertService
