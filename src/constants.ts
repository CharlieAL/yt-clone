export const DEFAULT_LIMIT = 5
export const DEFAULT_LIMIT_COMMENTS = 5
export const DEFAULT_LIMIT_SUGGESTIONS = 5

export const THUMBNAIL_FALLBACK = '/placeholder.svg'

export const APP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'
