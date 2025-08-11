import { NextApiRequest, NextApiResponse } from 'next'

const API_BASE_URL = 'https://kmp-production.up.railway.app/serenenow/api/v1'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path, ...queryParams } = req.query
  const endpoint = Array.isArray(path) ? path.join('/') : path

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing API path' })
  }

  // Build URL with query parameters
  const baseUrl = `${API_BASE_URL}/${endpoint}`
  const url = new URL(baseUrl)
  
  // Add all query parameters except 'path'
  Object.entries(queryParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v))
    } else if (value) {
      url.searchParams.append(key, value)
    }
  })

  try {
    // Forward all headers except host
    const forwardHeaders: Record<string, string> = {}
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'host' && typeof value === 'string') {
        forwardHeaders[key] = value
      }
    })

    // Forward cookies from the request
    if (req.headers.cookie) {
      forwardHeaders['cookie'] = req.headers.cookie
    }

    const response = await fetch(url.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      credentials: 'include',
    })

    // Forward response headers, especially Set-Cookie
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        res.setHeader('Set-Cookie', value)
      } else if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value)
      }
    })

    const data = await response.text()
    res.status(response.status).send(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed' })
  }
}
