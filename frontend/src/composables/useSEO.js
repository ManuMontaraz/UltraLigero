import { useHead } from '@vueuse/head'

const ensureAbsoluteUrl = (value, appUrl, defaultPath = '/og-default.jpg') => {
  if (!value) return `${appUrl}${defaultPath}`
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${appUrl}${value.startsWith('/') ? '' : '/'}${value}`
}

export function useSEO({
  title,
  description,
  image = null,
  url = null,
  type = 'website',
  schema = null
}) {
  const appName = import.meta.env.VITE_APP_NAME || 'LeafPack'
  const appUrl = (import.meta.env.VITE_APP_URL || 'https://leafpack.mntr.es').replace(/\/$/, '')
  const fullTitle = title ? `${title} | ${appName}` : `${appName} - Organiza tu Mochila de Viaje`
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : `${appUrl}/`)
  const ogImage = ensureAbsoluteUrl(image, appUrl)

  const meta = [
    { name: 'description', content: description },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
    { property: 'og:url', content: currentUrl },
    { property: 'og:type', content: type },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage }
  ]
  
  if (schema) {
    meta.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(schema)
    })
  }
  
  useHead({
    title: fullTitle,
    meta
  })
}
