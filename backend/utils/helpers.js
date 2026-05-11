/**
 * Genera un código corto único para mochilas
 * Mezcla de letras y números, fácil de compartir
 */
const generateCodigo = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusiones
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
};

/**
 * Añade el tag de afiliado a una URL (solo para dominios de Amazon)
 */
const addAffiliateTag = (url) => {
  if (!url) return null;

  const tag = process.env.AFFILIATE_TAG;
  if (!tag) return url;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Lista de dominios de Amazon
    const amazonDomains = [
      'amazon.com', 'amazon.es', 'amazon.co.uk', 'amazon.de',
      'amazon.fr', 'amazon.it', 'amazon.co.jp', 'amazon.ca',
      'amazon.com.mx', 'amazon.com.br', 'amazon.in', 'amazon.cn',
      'amzn.to', 'amazon.com.au', 'amazon.nl', 'amazon.se',
      'amazon.pl', 'amazon.sg', 'amazon.ae', 'amazon.sa'
    ];

    // Verificar si es un dominio de Amazon
    const isAmazon = amazonDomains.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );

    if (!isAmazon) return url;

    // Añadir el tag de afiliado
    urlObj.searchParams.set(tag.split('=')[0], tag.split('=')[1]);
    return urlObj.toString();
  } catch {
    return url;
  }
};

module.exports = {
  generateCodigo,
  addAffiliateTag
};
