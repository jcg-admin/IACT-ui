import apiService from './apiClient'

class SharesService {
  async createShare({ view_id, target_type, target_id, permission, expires_at, message }) {
    return apiService.post('/api/me/shares/', {
      view_id, target_type, target_id, permission, expires_at, message,
    })
  }

  async revokeShare(shareId) {
    return apiService.delete(`/api/me/shares/${shareId}/`)
  }

  async getSharesSent(params = {}) {
    return apiService.get('/api/me/shares/sent/', { params })
  }

  async getSharesReceived(params = {}) {
    return apiService.get('/api/me/shares/received/', { params })
  }
}

export default new SharesService()
