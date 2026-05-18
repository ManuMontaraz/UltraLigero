const pool = require('../config/database');

const initDatabase = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Conectado a MariaDB');

    // Crear tabla mochilas
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mochilas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(10) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        edit_password_hash VARCHAR(255),
        is_private BOOLEAN DEFAULT FALSE,
        parent_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES mochilas(id) ON DELETE SET NULL
      )
    `);

    // Crear tabla grupos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS grupos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        icono VARCHAR(50) DEFAULT 'box',
        color VARCHAR(20) DEFAULT 'gray',
        orden INT DEFAULT 0,
        edit_password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Añadir columna edit_password_hash a grupos si no existe
    try {
      await conn.query('ALTER TABLE grupos ADD COLUMN edit_password_hash VARCHAR(255)');
      console.log('Columna edit_password_hash añadida a grupos');
    } catch (e) {
      // Columna ya existe
    }

    // Crear tabla objetos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS objetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        peso_gr INT DEFAULT 0,
        precio DECIMAL(10,2) DEFAULT 0,
        url_compra VARCHAR(500),
        imagen_url VARCHAR(500),
        grupo_id INT,
        edit_password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL
      )
    `);

    // Añadir columna edit_password_hash a objetos si no existe
    try {
      await conn.query('ALTER TABLE objetos ADD COLUMN edit_password_hash VARCHAR(255)');
      console.log('Columna edit_password_hash añadida a objetos');
    } catch (e) {
      // Columna ya existe
    }

    // Crear tabla relación mochila-objetos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mochila_objetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mochila_id INT NOT NULL,
        objeto_id INT NOT NULL,
        cantidad INT DEFAULT 1,
        cantidad_local INT,
        peso_local INT,
        precio_local DECIMAL(10,2),
        notas TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mochila_id) REFERENCES mochilas(id) ON DELETE CASCADE,
        FOREIGN KEY (objeto_id) REFERENCES objetos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_objeto_mochila (mochila_id, objeto_id)
      )
    `);

    // Añadir columna cantidad_local si no existe (migración)
    try {
      await conn.query('ALTER TABLE mochila_objetos ADD COLUMN cantidad_local INT');
      console.log('Columna cantidad_local añadida a mochila_objetos');
    } catch (e) {
      // Columna ya existe
    }

    // Añadir columna og_image_url a mochilas si no existe
    try {
      await conn.query('ALTER TABLE mochilas ADD COLUMN og_image_url VARCHAR(500)');
      console.log('Columna og_image_url añadida a mochilas');
    } catch (e) {
      // Columna ya existe
    }

    // Migración: eliminar view_password_hash y añadir is_private si no existe
    try {
      await conn.query('ALTER TABLE mochilas DROP COLUMN view_password_hash');
      console.log('Columna view_password_hash eliminada de mochilas');
    } catch (e) {
      // Columna no existía
    }
    try {
      await conn.query('ALTER TABLE mochilas ADD COLUMN is_private BOOLEAN DEFAULT FALSE');
      console.log('Columna is_private añadida a mochilas');
    } catch (e) {
      // Columna ya existe
    }

    // Migración: añadir parent_id si no existe
    try {
      await conn.query('ALTER TABLE mochilas ADD COLUMN parent_id INT');
      console.log('Columna parent_id añadida a mochilas');
    } catch (e) {
      // Columna ya existe
    }
    try {
      await conn.query('ALTER TABLE mochilas ADD FOREIGN KEY (parent_id) REFERENCES mochilas(id) ON DELETE SET NULL');
      console.log('Foreign key parent_id añadida a mochilas');
    } catch (e) {
      // FK ya existe
    }

    // Insertar grupos predefinidos si no existen
    const gruposExistentes = await conn.query('SELECT COUNT(*) as count FROM grupos');
    if (gruposExistentes[0].count === 0) {
      const gruposPredefinidos = [
        { nombre: 'Higiene', icono: 'sparkles', color: 'blue', orden: 1 },
        { nombre: 'Cocina', icono: 'utensils', color: 'orange', orden: 2 },
        { nombre: 'Ropa', icono: 'shirt', color: 'purple', orden: 3 },
        { nombre: 'Electrónica', icono: 'bolt', color: 'yellow', orden: 4 },
        { nombre: 'Comida', icono: 'apple', color: 'green', orden: 5 },
        { nombre: 'Documentación', icono: 'document', color: 'red', orden: 6 },
        { nombre: 'Descanso', icono: 'moon', color: 'indigo', orden: 7 },
        { nombre: 'Otros', icono: 'box', color: 'gray', orden: 8 }
      ];

      for (const grupo of gruposPredefinidos) {
        await conn.query(
          'INSERT INTO grupos (nombre, icono, color, orden) VALUES (?, ?, ?, ?)',
          [grupo.nombre, grupo.icono, grupo.color, grupo.orden]
        );
      }
      console.log('Grupos predefinidos insertados');
    }

    // Migración: añadir grupo Descanso si no existe
    try {
      const descansoExistente = await conn.query('SELECT id FROM grupos WHERE nombre = ?', ['Descanso']);
      if (descansoExistente.length === 0) {
        await conn.query(
          'INSERT INTO grupos (nombre, icono, color, orden) VALUES (?, ?, ?, ?)',
          ['Descanso', 'moon', 'indigo', 7]
        );
        console.log('Grupo Descanso añadido');
        
        // Actualizar orden de Otros a 8
        await conn.query(
          'UPDATE grupos SET orden = ? WHERE nombre = ?',
          [8, 'Otros']
        );
        console.log('Orden de grupo Otros actualizado a 8');
      }
    } catch (e) {
      console.error('Error añadiendo grupo Descanso:', e);
    }

    // Migración: eliminar capacidad_kg si existe
    try {
      await conn.query('ALTER TABLE mochilas DROP COLUMN capacidad_kg');
      console.log('Columna capacidad_kg eliminada de mochilas');
    } catch (e) {
      // Columna no existía o ya fue eliminada
    }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error inicializando base de datos:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = initDatabase;
