/**
 * Generates a shareable URL with current filters encoded as query params.
 * @param {string} basePath - e.g. '/reports/agents'
 * @param {Object} filters - { dateFrom, dateTo, agentId, ... }
 * @returns {string} Full URL
 */
export function buildShareUrl(basePath, filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value != null) params.set(key, value)
  })
  const qs = params.toString()
  return `${window.location.origin}${basePath}${qs ? `?${qs}` : ''}`
}

/**
 * Parses query params from the current URL and returns a filters object.
 * @returns {Object} filters
 */
export function parseFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const filters = {}
  params.forEach((value, key) => {
    filters[key] = value
  })
  return filters
}
