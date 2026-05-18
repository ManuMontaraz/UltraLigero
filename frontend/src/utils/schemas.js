export const generateBackpackSchema = (mochila, objetos) => {
  const totalPeso = objetos.reduce((sum, obj) => sum + (obj.peso_gr * obj.cantidad), 0)
  const totalPrecio = objetos.reduce((sum, obj) => sum + (obj.precio * obj.cantidad), 0)
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Mochila de Viaje - ${mochila.nombre}`,
    "description": mochila.descripcion || `Mochila ultraligera con ${objetos.length} objetos`,
    "url": `https://leafpack.mntr.es/m/${mochila.codigo}`,
    "numberOfItems": objetos.length,
    "itemListElement": objetos.map((obj, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": obj.nombre,
        "description": obj.descripcion,
        "weight": {
          "@type": "QuantitativeValue",
          "value": obj.peso_gr,
          "unitCode": "GRM"
        },
        "offers": obj.precio > 0 ? {
          "@type": "Offer",
          "price": obj.precio.toString(),
          "priceCurrency": "EUR",
          "url": obj.url_compra
        } : undefined,
        "image": obj.imagen_url
      }
    })),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "1"
    }
  }
}

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": import.meta.env.VITE_APP_NAME || 'LeafPack',
  "url": "https://leafpack.mntr.es",
  "logo": "https://leafpack.mntr.es/logo.png",
  "sameAs": []
})

export const generateWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": import.meta.env.VITE_APP_NAME || 'LeafPack',
  "url": "https://leafpack.mntr.es",
  "description": "Gestiona tu equipaje ultraligero. Calcula peso, precio y organiza objetos por categorías.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://leafpack.mntr.es/m/{search_term_string}",
    "query-input": "required name=search_term_string"
  }
})
