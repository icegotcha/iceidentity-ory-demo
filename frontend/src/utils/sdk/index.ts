import type { NextApiRequest } from 'next'

export const isQuerySet = (x: string | undefined): x is string => typeof x === 'string' && x.length > 0

export const removeTrailingSlash = (s: string) => s.replace(/\/$/, '')

export const getUrlForFlow = (base: string, flow: string, query?: URLSearchParams) =>
  `${removeTrailingSlash(base)}/self-service/${flow}/browser${query ? `?${query.toString()}` : ''}`

export const getRequestUrl = (req: NextApiRequest) => {
  const protocol = req.headers.referer?.split('://')[0]
  return `${protocol}://${req.headers.host}${req.url}`
}
