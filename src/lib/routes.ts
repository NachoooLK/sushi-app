export const tableHref = (code: string) => `/mesa/${code}`
export const resultHref = (code: string) => `/mesa/${code}/resultado`

export function newTableHref(prefill?: { restaurant?: string | null; location?: string | null }) {
  const params = new URLSearchParams()
  if (prefill?.restaurant) params.set("restaurante", prefill.restaurant)
  if (prefill?.location) params.set("zona", prefill.location)
  const query = params.toString()
  return query ? `/mesa/nueva?${query}` : "/mesa/nueva"
}
