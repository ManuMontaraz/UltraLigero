const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Procesa una imagen subida:
 * - Convierte a WebP si no lo es ya
 * - Redimensiona a altura máxima 1080px (fit:inside, no agrandar)
 * - Calidad WebP: 85%
 * - Elimina el archivo original
 * 
 * @param {string} inputPath - Ruta del archivo subido por multer
 * @returns {Promise<string>} - Ruta del archivo procesado
 */
async function processImage(inputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const baseName = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    const outputPath = path.join(dir, `${baseName}_${Date.now()}.webp`);

    // Procesar con sharp (ignorar animación en GIFs)
    await sharp(inputPath, { animated: false })
      .resize({
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true // No agrandar imágenes pequeñas
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Eliminar archivo original
    fs.unlinkSync(inputPath);

    return outputPath;
  } catch (err) {
    console.error('Error procesando imagen:', err);
    throw err;
  }
}

module.exports = { processImage };
