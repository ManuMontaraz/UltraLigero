const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    // Obtener todas las mochilas públicas (sin contraseña de visualización)
    const mochilas = await conn.query(
      `SELECT codigo, updated_at FROM mochilas 
       WHERE view_password_hash IS NULL 
       ORDER BY updated_at DESC`
    );
    
    conn.release();
    
    const urls = [
      {
        loc: 'https://leafpack.mntr.es/',
        priority: '1.0',
        changefreq: 'weekly'
      },
      {
        loc: 'https://leafpack.mntr.es/crear',
        priority: '0.8',
        changefreq: 'monthly'
      },
      ...mochilas.map(m => ({
        loc: `https://leafpack.mntr.es/m/${m.codigo}`,
        lastmod: new Date(m.updated_at).toISOString().split('T')[0],
        priority: '0.6',
        changefreq: 'weekly'
      }))
    ];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority}</priority>
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
  </url>`).join('\n')}
</urlset>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
