const pool = require('../config/database');
const { addAffiliateTag } = require('../utils/helpers');
const { convertBigInt } = require('../utils/serializer');
const bcrypt = require('bcryptjs');

const objetosController = {
  // Obtener todos los objetos
  getAll: async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const objetos = await conn.query(
        `SELECT o.*, g.nombre as grupo_nombre, g.icono as grupo_icono, g.color as grupo_color
         FROM objetos o
         LEFT JOIN grupos g ON o.grupo_id = g.id
         ORDER BY o.nombre`
      );

      // Añadir tag de afiliado
      const objetosConAfiliado = objetos.map(obj => ({
        ...obj,
        url_compra: addAffiliateTag(obj.url_compra),
        tiene_password: obj.edit_password_hash ? true : false,
        edit_password_hash: undefined // No enviar al frontend
      }));

      res.json(objetosConAfiliado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Obtener objeto por ID
  getById: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      conn = await pool.getConnection();
      
      const objetos = await conn.query(
        `SELECT o.*, g.nombre as grupo_nombre, g.icono as grupo_icono, g.color as grupo_color
         FROM objetos o
         LEFT JOIN grupos g ON o.grupo_id = g.id
         WHERE o.id = ?`,
        [id]
      );

      if (objetos.length === 0) {
        return res.status(404).json({ error: 'Objeto no encontrado' });
      }

      const objeto = objetos[0];
      objeto.url_compra = addAffiliateTag(objeto.url_compra);
      objeto.tiene_password = objeto.edit_password_hash ? true : false;
      objeto.edit_password_hash = undefined;

      res.json(objeto);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Verificar contraseña de edición
  verificarPassword: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { editPassword } = req.body;

      if (!editPassword) {
        return res.status(400).json({ error: 'Se requiere contraseña' });
      }

      conn = await pool.getConnection();
      const objetos = await conn.query(
        'SELECT edit_password_hash FROM objetos WHERE id = ?',
        [id]
      );

      if (objetos.length === 0) {
        return res.status(404).json({ error: 'Objeto no encontrado' });
      }

      // Si no tiene contraseña, está libre
      if (!objetos[0].edit_password_hash) {
        return res.json({ valid: true, message: 'Sin contraseña' });
      }

      const validPassword = await bcrypt.compare(editPassword, objetos[0].edit_password_hash);
      
      if (validPassword) {
        res.json({ valid: true, message: 'Contraseña correcta' });
      } else {
        res.status(403).json({ valid: false, error: 'Contraseña incorrecta' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Crear nuevo objeto
  create: async (req, res) => {
    let conn;
    try {
      // Log para debugging
      console.log('Body recibido:', req.body);
      console.log('File recibido:', req.file);
      console.log('isAdmin:', req.isAdmin);
      
      const { nombre, descripcion, peso_gr, precio, url_compra, grupo_id, editPassword, mochilaEditPassword } = req.body;
      const imagen_url = req.file ? `/uploads/objetos/${req.file.filename}` : null;
      const isAdmin = req.isAdmin || req.body.isAdmin || false;

      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      conn = await pool.getConnection();

      // Si se proporciona mochilaEditPassword, usar esa como contraseña del objeto
      // Si se proporciona editPassword específico, usar esa
      // Admin puede crear objetos sin contraseña o asignar una
      let passwordHash = null;
      if (isAdmin && editPassword) {
        // Admin asigna contraseña
        passwordHash = await bcrypt.hash(editPassword, 10);
      } else if (mochilaEditPassword && mochilaEditPassword.trim() !== '') {
        passwordHash = await bcrypt.hash(mochilaEditPassword, 10);
      } else if (editPassword && editPassword.trim() !== '') {
        passwordHash = await bcrypt.hash(editPassword, 10);
      }

      // Convertir valores vacíos a null/0
      const grupoIdValue = grupo_id && grupo_id !== '' && grupo_id !== 'null' ? parseInt(grupo_id) : null;
      const pesoValue = peso_gr && peso_gr !== '' ? parseInt(peso_gr) || 0 : 0;
      const precioValue = precio && precio !== '' ? parseFloat(precio) || 0 : 0;
      const descripcionValue = descripcion && descripcion.trim() !== '' ? descripcion.trim() : null;
      const urlValue = url_compra && url_compra.trim() !== '' ? url_compra.trim() : null;

      console.log('Valores a insertar:', {
        nombre: nombre.trim(),
        descripcion: descripcionValue,
        peso: pesoValue,
        precio: precioValue,
        url: urlValue,
        imagen: imagen_url,
        grupo: grupoIdValue,
        tienePassword: passwordHash ? 'Sí' : 'No'
      });

      const result = await conn.query(
        `INSERT INTO objetos (nombre, descripcion, peso_gr, precio, url_compra, imagen_url, grupo_id, edit_password_hash) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre.trim(), descripcionValue, pesoValue, precioValue, urlValue, imagen_url, grupoIdValue, passwordHash]
      );

      const newObjeto = await conn.query(
        `SELECT o.*, g.nombre as grupo_nombre, g.icono as grupo_icono, g.color as grupo_color
         FROM objetos o
         LEFT JOIN grupos g ON o.grupo_id = g.id
         WHERE o.id = ?`,
        [result.insertId]
      );

      const response = convertBigInt(newObjeto[0]);
      response.tiene_password = response.edit_password_hash ? true : false;
      response.edit_password_hash = undefined;

      res.status(201).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Actualizar objeto
  update: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { nombre, descripcion, peso_gr, precio, url_compra, grupo_id, editPassword, newEditPassword } = req.body;
      const imagen_url = req.file ? `/uploads/objetos/${req.file.filename}` : undefined;
      const isAdmin = req.isAdmin || req.body.isAdmin || false;

      conn = await pool.getConnection();

      // Verificar contraseña si el objeto tiene una (a menos que sea admin)
      if (!isAdmin) {
        const objetoActual = await conn.query(
          'SELECT edit_password_hash FROM objetos WHERE id = ?',
          [id]
        );

        if (objetoActual.length === 0) {
          return res.status(404).json({ error: 'Objeto no encontrado' });
        }

        // Si tiene contraseña, verificarla
        if (objetoActual[0].edit_password_hash) {
          if (!editPassword) {
            return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
          }

          const validPassword = await bcrypt.compare(editPassword, objetoActual[0].edit_password_hash);
          if (!validPassword) {
            return res.status(403).json({ error: 'Contraseña incorrecta' });
          }
        }
      }

      // Construir query dinámica
      const updates = [];
      const values = [];

      if (nombre !== undefined) { updates.push('nombre = ?'); values.push(nombre); }
      if (descripcion !== undefined) { updates.push('descripcion = ?'); values.push(descripcion); }
      if (peso_gr !== undefined) { updates.push('peso_gr = ?'); values.push(peso_gr); }
      if (precio !== undefined) { updates.push('precio = ?'); values.push(precio); }
      if (url_compra !== undefined) { updates.push('url_compra = ?'); values.push(url_compra); }
      if (grupo_id !== undefined) { updates.push('grupo_id = ?'); values.push(grupo_id); }
      if (imagen_url !== undefined) { updates.push('imagen_url = ?'); values.push(imagen_url); }
      
      // Admin puede cambiar la contraseña
      // newEditPassword: null = eliminar, string = actualizar, undefined/vacío = mantener
      if (isAdmin && newEditPassword !== undefined) {
        if (newEditPassword === null) {
          // Explicitamente null = eliminar contraseña
          updates.push('edit_password_hash = ?');
          values.push(null);
        } else if (newEditPassword) {
          // Hay valor = actualizar contraseña
          const passwordHash = await bcrypt.hash(newEditPassword, 10);
          updates.push('edit_password_hash = ?');
          values.push(passwordHash);
        }
        // Si es string vacío "" → ignorar (mantener actual)
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);
      await conn.query(
        `UPDATE objetos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updatedObjeto = await conn.query(
        `SELECT o.*, g.nombre as grupo_nombre, g.icono as grupo_icono, g.color as grupo_color
         FROM objetos o
         LEFT JOIN grupos g ON o.grupo_id = g.id
         WHERE o.id = ?`,
        [id]
      );

      if (updatedObjeto.length === 0) {
        return res.status(404).json({ error: 'Objeto no encontrado' });
      }

      const response = convertBigInt(updatedObjeto[0]);
      response.url_compra = addAffiliateTag(response.url_compra);
      response.tiene_password = response.edit_password_hash ? true : false;
      response.edit_password_hash = undefined;

      res.json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Eliminar objeto
  delete: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { editPassword } = req.body || {};
      const isAdmin = req.isAdmin || req.body?.isAdmin || false;

      conn = await pool.getConnection();

      // Verificar contraseña si el objeto tiene una (a menos que sea admin)
      if (!isAdmin) {
        const objetoActual = await conn.query(
          'SELECT edit_password_hash FROM objetos WHERE id = ?',
          [id]
        );

        if (objetoActual.length === 0) {
          return res.status(404).json({ error: 'Objeto no encontrado' });
        }

        // Si tiene contraseña, verificarla
        if (objetoActual[0].edit_password_hash) {
          if (!editPassword) {
            return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
          }

          const validPassword = await bcrypt.compare(editPassword, objetoActual[0].edit_password_hash);
          if (!validPassword) {
            return res.status(403).json({ error: 'Contraseña incorrecta' });
          }
        }
      }

      await conn.query('DELETE FROM objetos WHERE id = ?', [id]);
      
      res.json({ message: 'Objeto eliminado' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  }
};

module.exports = objetosController;
