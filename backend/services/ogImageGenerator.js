const nodeHtmlToImage = require('node-html-to-image')
const fs = require('fs')
const path = require('path')

const OG_IMAGES_DIR = path.join(__dirname, '../../uploads/og')

// Asegurar que existe el directorio
if (!fs.existsSync(OG_IMAGES_DIR)) {
  fs.mkdirSync(OG_IMAGES_DIR, { recursive: true })
}

const generateOGImage = async (mochila, objetos) => {
  const { codigo, nombre } = mochila
  
  // Calcular stats
  const totalPeso = objetos.reduce((sum, obj) => sum + ((obj.peso_gr || obj.peso_local || 0) * (obj.cantidad || 1)), 0)
  const totalPrecio = objetos.reduce((sum, obj) => sum + ((obj.precio || obj.precio_local || 0) * (obj.cantidad || 1)), 0)
  const totalObjetos = objetos.reduce((sum, obj) => sum + (obj.cantidad || 1), 0)
  
  // Categorías únicas
  const categorias = [...new Set(objetos.map(obj => obj.grupo_nombre).filter(Boolean))]
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
          margin: 0;
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          font-family: 'Inter', sans-serif;
          color: white;
          display: flex;
          flex-direction: column;
          padding: 60px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        
        .logo {
          position: absolute;
          top: 40px;
          left: 60px;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .leaf-icon {
          width: 40px;
          height: 40px;
        }
        
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 10;
        }
        
        .title {
          font-size: 64px;
          font-weight: 700;
          margin: 0 0 20px 0;
          line-height: 1.2;
        }
        
        .code {
          font-size: 36px;
          opacity: 0.9;
          font-family: monospace;
          margin-bottom: 30px;
        }
        
        .stats {
          display: flex;
          gap: 40px;
          font-size: 28px;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .stat-value {
          font-weight: 700;
          font-size: 32px;
        }
        
        .categories {
          position: absolute;
          bottom: 40px;
          left: 60px;
          right: 60px;
          font-size: 20px;
          opacity: 0.8;
        }
        
        .url {
          position: absolute;
          bottom: 40px;
          right: 60px;
          font-size: 20px;
          opacity: 0.8;
        }
        
        .bg-pattern {
          position: absolute;
          right: -100px;
          top: -100px;
          width: 600px;
          height: 600px;
          opacity: 0.1;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L90 95 L10 95 Z" fill="white"/></svg>');
          transform: rotate(15deg);
        }
      </style>
    </head>
    <body>
      <div class="bg-pattern"></div>
      
      <div class="logo">
        <svg class="leaf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l.01.01c.18.15.38.27.59.36.17.07.35.13.54.16.13.02.26.03.4.03 2.21 0 4-1.79 4-4V6z"/>
        </svg>
        LeafPack
      </div>
      
      <div class="content">
        <h1 class="title">${nombre}</h1>
        <div class="code">🎒 ${codigo}</div>
        
        <div class="stats">
          <div class="stat">
            <span>⚖️</span>
            <span class="stat-value">${totalPeso.toFixed(0)}g</span>
          </div>
          <div class="stat">
            <span>💰</span>
            <span class="stat-value">${totalPrecio.toFixed(2)}€</span>
          </div>
          <div class="stat">
            <span>📦</span>
            <span class="stat-value">${totalObjetos}</span>
          </div>
        </div>
      </div>
      
      <div class="categories">
        ${categorias.slice(0, 5).join(' • ')}
      </div>
      
      <div class="url">leafpack.mntr.es</div>
    </body>
    </html>
  `
  
  const outputPath = path.join(OG_IMAGES_DIR, `${codigo}.png`)
  
  await nodeHtmlToImage({
    html,
    output: outputPath,
    puppeteerArgs: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  })
  
  return `/uploads/og/${codigo}.png`
}

const deleteOGImage = async (codigo) => {
  const filePath = path.join(OG_IMAGES_DIR, `${codigo}.png`)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

module.exports = {
  generateOGImage,
  deleteOGImage
}
