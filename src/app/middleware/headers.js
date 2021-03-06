const cspValues = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://cdnjs.cloudflare.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' https://www.google-analytics.com`,
  `form-action 'self'`,
  `connect-src 'self'`,
].join(';')

module.exports = function (isDev) {
  return function (req, res, next) {
    res.setHeader('X-Download-Options', 'noopen')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'deny')
    res.setHeader('Content-Security-Policy', cspValues)
    res.setHeader('Cache-Control', 'no-cache, no-store')

    if (!isDev) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000 includeSubDomains')
    }

    next()
  }
}
