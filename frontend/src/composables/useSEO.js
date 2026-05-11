import { useHead } from '@vueuse/head'

export function useSEO({ 
  title, 
  description, 
  image = 'https://leafpack.mntr.es/og-default.jpg',
  url = null,
  type = 'website',
  schema = null
}) {
  const fullTitle = title ? `${title} | LeafPack` : 'LeafPack - Organiza tu Mochila de Viaje'
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://leafpack.mntr.es/')
  
  const meta = [
    { name: 'description', content: description },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: currentUrl },
    { property: 'og:type', content: type },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
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
