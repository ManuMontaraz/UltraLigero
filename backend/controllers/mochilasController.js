const pool = require('../config/database');
const { generateCodigo, addAffiliateTag } = require('../utils/helpers');
const { convertBigInt } = require('../utils/serializer');
const bcrypt = require('bcryptjs');
const { generateOGImage, deleteOGImage } = require('../services/ogImageGenerator');

const mochilasController = {
  // Obtener todas las mochilas públicas (versión limitada)
  getAll: async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const mochilas = await conn.query(
        `SELECT m.id, m.codigo, m.nombre, m.descripcion, m.created_at, m.is_private,
                COALESCE(SUM(COALESCE(mo.peso_local, o.peso_gr) * COALESCE(mo.cantidad_local, mo.cantidad)), 0) as peso_total
         FROM mochilas m
         LEFT JOIN mochila_objetos mo ON m.id = mo.mochila_id
         LEFT JOIN objetos o ON mo.objeto_id = o.id
         WHERE m.is_private = FALSE OR m.is_private IS NULL
         GROUP BY m.id, m.codigo, m.nombre, m.descripcion, m.created_at, m.is_private
         ORDER BY m.created_at DESC`
      );
      res.json(mochilas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Obtener todas las mochilas (versión completa para admin)
  getAllAdmin: async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const mochilas = await conn.query(
        `SELECT id, codigo, nombre, descripcion, 
                edit_password_hash, is_private, created_at
         FROM mochilas 
         ORDER BY created_at DESC`
      );

      const mochilasFormatted = mochilas.map(m => ({
        ...m,
        tiene_edit_password: m.edit_password_hash ? true : false,
        is_private: m.is_private ? true : false
      }));

      res.json(mochilasFormatted);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Obtener una mochila por código
  getByCodigo: async (req, res) => {
    let conn;
    try {
      const { codigo } = req.params;
      const { editPassword } = req.body;

      conn = await pool.getConnection();
      
      const mochilas = await conn.query(
        `SELECT m.*, p.codigo as parent_codigo, p.nombre as parent_nombre
         FROM mochilas m
         LEFT JOIN mochilas p ON m.parent_id = p.id
         WHERE m.codigo = ?`,
        [codigo]
      );

      if (mochilas.length === 0) {
        return res.status(404).json({ error: 'Mochila no encontrada' });
      }

      const mochila = mochilas[0];

      // Verificar contraseña si la mochila es privada
      if (mochila.is_private && mochila.edit_password_hash) {
        if (!editPassword) {
          return res.status(401).json({ error: 'Esta mochila requiere contraseña para ver', requirePassword: true });
        }
        
        const validPassword = await bcrypt.compare(editPassword, mochila.edit_password_hash);
        if (!validPassword) {
          return res.status(403).json({ error: 'Contraseña incorrecta' });
        }
      }

      // Obtener objetos de la mochila (con valores locales aplicados)
      const objetos = await conn.query(
        `SELECT 
          o.id, o.nombre, o.descripcion, o.peso_gr, o.precio, 
          o.url_compra, o.imagen_url, o.edit_password_hash as objeto_password_hash,
          mo.cantidad, mo.cantidad_local, mo.peso_local, mo.precio_local, mo.notas,
          g.id as grupo_id, g.nombre as grupo_nombre, g.icono as grupo_icono, g.color as grupo_color,
          g.edit_password_hash as grupo_password_hash
         FROM mochila_objetos mo
         JOIN objetos o ON mo.objeto_id = o.id
         LEFT JOIN grupos g ON o.grupo_id = g.id
         WHERE mo.mochila_id = ?
         ORDER BY g.orden, o.nombre`,
        [mochila.id]
      );
      
      // Incluir og_image_url en la respuesta
      const mochilaConOG = await conn.query('SELECT og_image_url FROM mochilas WHERE id = ?', [mochila.id]);

      // Procesar objetos aplicando valores locales y marcando cambios
      const objetosProcesados = objetos.map(obj => {
        const tienePasswordObjeto = obj.objeto_password_hash ? true : false;
        const tienePasswordGrupo = obj.grupo_password_hash ? true : false;
        
        // Aplicar valores locales si existen
        const tieneCambiosLocales = obj.cantidad_local !== null || obj.peso_local !== null || obj.precio_local !== null;
        
        // Valores efectivos (locales tienen prioridad)
        const cantidadEfectiva = obj.cantidad_local !== null ? obj.cantidad_local : obj.cantidad;
        const pesoEfectivo = obj.peso_local !== null ? obj.peso_local : obj.peso_gr;
        const precioEfectivo = obj.precio_local !== null ? obj.precio_local : obj.precio;

        return {
          ...obj,
          // Valores base originales (para referencia si se necesita)
          cantidad_base: obj.cantidad,
          peso_gr_base: obj.peso_gr,
          precio_base: obj.precio,
          // Valores efectivos (aplicados)
          cantidad: cantidadEfectiva,
          peso_gr: pesoEfectivo,
          precio: precioEfectivo,
          // Metadata
          tiene_cambios_locales: tieneCambiosLocales,
          url_compra: addAffiliateTag(obj.url_compra),
          tiene_password: tienePasswordObjeto,
          tiene_password_grupo: tienePasswordGrupo,
          // Limpiar datos sensibles
          objeto_password_hash: undefined,
          grupo_password_hash: undefined
        };
      });

      // Preparar datos del padre
      const parentData = {};
      if (mochila.parent_id) {
        if (mochila.parent_codigo) {
          parentData.parent_id = mochila.parent_id;
          parentData.parent_codigo = mochila.parent_codigo;
          parentData.parent_nombre = mochila.parent_nombre;
        } else {
          parentData.parent_id = mochila.parent_id;
          parentData.parent_eliminado = true;
        }
      }

      res.json({
        ...mochila,
        tiene_edit_password: mochila.edit_password_hash ? true : false,
        edit_password_hash: undefined, // No enviar al frontend
        is_private: mochila.is_private ? true : false,
        og_image_url: mochilaConOG[0]?.og_image_url || null,
        ...parentData,
        objetos: objetosProcesados
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Crear nueva mochila
  create: async (req, res) => {
    let conn;
    try {
      const { nombre, descripcion, editPassword, isPrivate } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      conn = await pool.getConnection();

      // Generar código único
      let codigo = generateCodigo();
      let existe = true;
      let intentos = 0;

      while (existe && intentos < 10) {
        const result = await conn.query('SELECT id FROM mochilas WHERE codigo = ?', [codigo]);
        if (result.length === 0) {
          existe = false;
        } else {
          codigo = generateCodigo();
          intentos++;
        }
      }

      if (existe) {
        return res.status(500).json({ error: 'No se pudo generar un código único' });
      }

      // Hashear contraseña si se proporciona
      const editPasswordHash = editPassword ? await bcrypt.hash(editPassword, 10) : null;

      const result = await conn.query(
        `INSERT INTO mochilas (codigo, nombre, descripcion, edit_password_hash, is_private) 
         VALUES (?, ?, ?, ?, ?)`,
        [codigo, nombre, descripcion, editPasswordHash, isPrivate || false]
      );

      const newMochila = {
        id: convertBigInt(result.insertId),
        codigo,
        nombre,
        descripcion,
        tiene_edit_password: editPasswordHash ? true : false,
        is_private: isPrivate || false,
        message: 'Mochila creada exitosamente'
      };

      res.status(201).json(newMochila);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Actualizar mochila
  update: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { nombre, descripcion, editPassword, newEditPassword, isPrivate } = req.body;
      const isAdmin = req.isAdmin || req.body.isAdmin || false;

      conn = await pool.getConnection();

      // Verificar contraseña de edición si existe (a menos que sea admin)
      if (!isAdmin) {
        const mochilaActual = await conn.query(
          'SELECT edit_password_hash FROM mochilas WHERE id = ?',
          [id]
        );

        if (mochilaActual.length === 0) {
          return res.status(404).json({ error: 'Mochila no encontrada' });
        }

        if (mochilaActual[0].edit_password_hash) {
          if (!editPassword) {
            return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
          }

          const validPassword = await bcrypt.compare(editPassword, mochilaActual[0].edit_password_hash);
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
      
      // Cualquier usuario autenticado puede cambiar privacidad
      if (isPrivate !== undefined) {
        updates.push('is_private = ?');
        values.push(isPrivate ? 1 : 0);
      }
      
      // Solo admin puede cambiar la contraseña de edición
      if (isAdmin) {
        // newEditPassword: null = eliminar, string = actualizar, undefined/vacío = mantener
        if (newEditPassword !== undefined) {
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
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);
      await conn.query(
        `UPDATE mochilas SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({ message: 'Mochila actualizada' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Eliminar mochila
  delete: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { editPassword } = req.body || {};
      const isAdmin = req.isAdmin || req.body?.isAdmin || false;

      conn = await pool.getConnection();

      // Verificar contraseña de edición si existe (a menos que sea admin)
      if (!isAdmin) {
        const mochilaActual = await conn.query(
          'SELECT edit_password_hash FROM mochilas WHERE id = ?',
          [id]
        );

        if (mochilaActual.length === 0) {
          return res.status(404).json({ error: 'Mochila no encontrada' });
        }

        if (mochilaActual[0].edit_password_hash) {
          if (!editPassword) {
            return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
          }

          const validPassword = await bcrypt.compare(editPassword, mochilaActual[0].edit_password_hash);
          if (!validPassword) {
            return res.status(403).json({ error: 'Contraseña incorrecta' });
          }
        }
      }

      // Obtener código para eliminar imagen OG
      const mochila = await conn.query('SELECT codigo FROM mochilas WHERE id = ?', [id]);
      if (mochila.length > 0) {
        await deleteOGImage(mochila[0].codigo);
      }
      
      await conn.query('DELETE FROM mochilas WHERE id = ?', [id]);
      
      res.json({ message: 'Mochila eliminada' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Añadir objeto a mochila
  addObjeto: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { objeto_id, cantidad, editPassword, isAdmin } = req.body;

      if (!objeto_id) {
        return res.status(400).json({ error: 'Se requiere el ID del objeto' });
      }

      conn = await pool.getConnection();

      // Verificar que la mochila existe
      const mochila = await conn.query('SELECT * FROM mochilas WHERE id = ?', [id]);
      if (mochila.length === 0) {
        return res.status(404).json({ error: 'Mochila no encontrada' });
      }

      // Verificar contraseña de edición si existe (a menos que sea admin)
      if (!isAdmin && mochila[0].edit_password_hash) {
        if (!editPassword) {
          return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
        }
        
        const validPassword = await bcrypt.compare(editPassword, mochila[0].edit_password_hash);
        if (!validPassword) {
          return res.status(403).json({ error: 'Contraseña de edición incorrecta' });
        }
      }

      // Añadir o actualizar objeto en mochila
      await conn.query(
        `INSERT INTO mochila_objetos (mochila_id, objeto_id, cantidad) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
        [id, objeto_id, cantidad || 1]
      );

      // Obtener datos actualizados de la mochila para generar imagen OG
      const mochilaActualizada = await conn.query('SELECT * FROM mochilas WHERE id = ?', [id]);
      const objetosDeMochila = await conn.query(
        `SELECT o.*, mo.cantidad, mo.cantidad_local, mo.peso_local, mo.precio_local,
                g.nombre as grupo_nombre
         FROM mochila_objetos mo
         JOIN objetos o ON mo.objeto_id = o.id
         LEFT JOIN grupos g ON o.grupo_id = g.id
         WHERE mo.mochila_id = ?`,
        [id]
      );
      
      // Generar imagen OG actualizada
      try {
        const ogImagePath = await generateOGImage(mochilaActualizada[0], objetosDeMochila);
        await conn.query('UPDATE mochilas SET og_image_url = ? WHERE id = ?', [ogImagePath, id]);
      } catch (ogErr) {
        console.error('Error generando imagen OG:', ogErr);
        // No fallar la operación principal si la imagen OG falla
      }

      res.json({ message: 'Objeto añadido a la mochila' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Eliminar objeto de mochila
  removeObjeto: async (req, res) => {
    let conn;
    try {
      const { id, objetoId } = req.params;
      const { editPassword, isAdmin } = req.body || {};

      conn = await pool.getConnection();

      // Verificar contraseña de edición (a menos que sea admin)
      const mochila = await conn.query('SELECT edit_password_hash FROM mochilas WHERE id = ?', [id]);
      if (mochila.length === 0) {
        return res.status(404).json({ error: 'Mochila no encontrada' });
      }

      if (!isAdmin && mochila[0].edit_password_hash) {
        if (!editPassword) {
          return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
        }
        
        const validPassword = await bcrypt.compare(editPassword, mochila[0].edit_password_hash);
        if (!validPassword) {
          return res.status(403).json({ error: 'Contraseña de edición incorrecta' });
        }
      }

      await conn.query(
        'DELETE FROM mochila_objetos WHERE mochila_id = ? AND objeto_id = ?',
        [id, objetoId]
      );

      // Actualizar imagen OG después de eliminar objeto
      try {
        const mochilaActualizada = await conn.query('SELECT * FROM mochilas WHERE id = ?', [id]);
        const objetosDeMochila = await conn.query(
          `SELECT o.*, mo.cantidad, mo.cantidad_local, mo.peso_local, mo.precio_local,
                  g.nombre as grupo_nombre
           FROM mochila_objetos mo
           JOIN objetos o ON mo.objeto_id = o.id
           LEFT JOIN grupos g ON o.grupo_id = g.id
           WHERE mo.mochila_id = ?`,
          [id]
        );
        
        if (objetosDeMochila.length > 0) {
          const ogImagePath = await generateOGImage(mochilaActualizada[0], objetosDeMochila);
          await conn.query('UPDATE mochilas SET og_image_url = ? WHERE id = ?', [ogImagePath, id]);
        } else {
          // Si no hay objetos, eliminar la imagen OG
          await conn.query('UPDATE mochilas SET og_image_url = NULL WHERE id = ?', [id]);
          await deleteOGImage(mochilaActualizada[0].codigo);
        }
      } catch (ogErr) {
        console.error('Error actualizando imagen OG:', ogErr);
      }

      res.json({ message: 'Objeto eliminado de la mochila' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Guardar cambios locales de un objeto en la mochila
  saveLocalChanges: async (req, res) => {
    let conn;
    try {
      const { id, objetoId } = req.params;
      const { cantidad_local, peso_local, precio_local, editPassword, isAdmin } = req.body;

      conn = await pool.getConnection();

      // Verificar que la mochila existe
      const mochila = await conn.query(
        'SELECT edit_password_hash FROM mochilas WHERE id = ?',
        [id]
      );

      if (mochila.length === 0) {
        return res.status(404).json({ error: 'Mochila no encontrada' });
      }

      // Verificar contraseña de edición si existe (a menos que sea admin)
      if (!isAdmin && mochila[0].edit_password_hash) {
        if (!editPassword) {
          return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
        }

        const validPassword = await bcrypt.compare(editPassword, mochila[0].edit_password_hash);
        if (!validPassword) {
          return res.status(403).json({ error: 'Contraseña de edición incorrecta' });
        }
      }

      // Verificar que existe la relación mochila-objeto
      const relacion = await conn.query(
        'SELECT id FROM mochila_objetos WHERE mochila_id = ? AND objeto_id = ?',
        [id, objetoId]
      );

      if (relacion.length === 0) {
        return res.status(404).json({ error: 'Objeto no encontrado en la mochila' });
      }

      // Construir update dinámico
      const updates = [];
      const values = [];

      if (cantidad_local !== undefined) {
        updates.push('cantidad_local = ?');
        values.push(cantidad_local === null || cantidad_local === '' ? null : parseInt(cantidad_local));
      }
      if (peso_local !== undefined) {
        updates.push('peso_local = ?');
        values.push(peso_local === null || peso_local === '' ? null : parseInt(peso_local));
      }
      if (precio_local !== undefined) {
        updates.push('precio_local = ?');
        values.push(precio_local === null || precio_local === '' ? null : parseFloat(precio_local));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id, objetoId);
      await conn.query(
        `UPDATE mochila_objetos SET ${updates.join(', ')} WHERE mochila_id = ? AND objeto_id = ?`,
        values
      );

      res.json({
        message: 'Cambios guardados',
        cambios: { cantidad_local, peso_local, precio_local }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Limpiar todos los cambios locales de una mochila
  clearLocalChanges: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { editPassword, isAdmin } = req.body;

      conn = await pool.getConnection();

      // Verificar que la mochila existe
      const mochila = await conn.query(
        'SELECT edit_password_hash FROM mochilas WHERE id = ?',
        [id]
      );

      if (mochila.length === 0) {
        return res.status(404).json({ error: 'Mochila no encontrada' });
      }

      // Verificar contraseña de edición si existe (a menos que sea admin)
      if (!isAdmin && mochila[0].edit_password_hash) {
        if (!editPassword) {
          return res.status(401).json({ error: 'Se requiere contraseña de edición', requirePassword: true });
        }

        const validPassword = await bcrypt.compare(editPassword, mochila[0].edit_password_hash);
        if (!validPassword) {
          return res.status(403).json({ error: 'Contraseña de edición incorrecta' });
        }
      }

      // Poner a NULL todos los campos locales de esta mochila
      await conn.query(
        'UPDATE mochila_objetos SET cantidad_local = NULL, peso_local = NULL, precio_local = NULL WHERE mochila_id = ?',
        [id]
      );

      res.json({ message: 'Todos los cambios locales han sido eliminados' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Clonar mochila con todos sus objetos y cambios locales
  clone: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { newEditPassword } = req.body || {};
      const isAdmin = req.isAdmin || req.body?.isAdmin || false;

      conn = await pool.getConnection();

      // 1. Verificar que la mochila existe y obtener sus datos
      const mochilaOriginal = await conn.query(
        'SELECT * FROM mochilas WHERE id = ?',
        [id]
      );

      if (mochilaOriginal.length === 0) {
        return res.status(404).json({ error: 'Mochila no encontrada' });
      }

      const original = mochilaOriginal[0];

      // 3. Generar nuevo código único
      let nuevoCodigo = generateCodigo();
      let existe = true;
      let intentos = 0;

      while (existe && intentos < 10) {
        const result = await conn.query('SELECT id FROM mochilas WHERE codigo = ?', [nuevoCodigo]);
        if (result.length === 0) {
          existe = false;
        } else {
          nuevoCodigo = generateCodigo();
          intentos++;
        }
      }

      if (existe) {
        return res.status(500).json({ error: 'No se pudo generar un código único' });
      }

      // 4. Determinar contraseña y privacidad de la copia
      let passwordHash = original.edit_password_hash;
      let isPrivate = original.is_private;
      
      // newEditPassword:
      // - null (explicitamente): sin contraseña, pública
      // - string: usar esa contraseña
      // - undefined: copiar la del padre (comportamiento por defecto)
      if (newEditPassword === null) {
        passwordHash = null;
        isPrivate = false;
      } else if (newEditPassword !== undefined) {
        passwordHash = await bcrypt.hash(newEditPassword, 10);
      }

      // 5. Crear nueva mochila copiando datos
      const nuevoNombre = original.nombre + ' (copia)';
      const result = await conn.query(
        `INSERT INTO mochilas (codigo, nombre, descripcion, edit_password_hash, is_private, parent_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          nuevoCodigo,
          nuevoNombre,
          original.descripcion,
          passwordHash,
          isPrivate,
          id
        ]
      );

      const nuevaMochilaId = convertBigInt(result.insertId);

      // 5. Copiar todos los objetos de la mochila original
      const objetosOriginal = await conn.query(
        `SELECT objeto_id, cantidad, cantidad_local, peso_local, precio_local, notas 
         FROM mochila_objetos 
         WHERE mochila_id = ?`,
        [id]
      );

      for (const obj of objetosOriginal) {
        await conn.query(
          `INSERT INTO mochila_objetos (mochila_id, objeto_id, cantidad, cantidad_local, peso_local, precio_local, notas) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            nuevaMochilaId,
            obj.objeto_id,
            obj.cantidad,
            obj.cantidad_local,
            obj.peso_local,
            obj.precio_local,
            obj.notas
          ]
        );
      }

      // 6. Generar imagen OG para la nueva mochila
      try {
        const nuevaMochila = await conn.query('SELECT * FROM mochilas WHERE id = ?', [nuevaMochilaId]);
        const objetosNuevaMochila = await conn.query(
          `SELECT o.*, mo.cantidad, mo.cantidad_local, mo.peso_local, mo.precio_local,
                  g.nombre as grupo_nombre
           FROM mochila_objetos mo
           JOIN objetos o ON mo.objeto_id = o.id
           LEFT JOIN grupos g ON o.grupo_id = g.id
           WHERE mo.mochila_id = ?`,
          [nuevaMochilaId]
        );
        
        if (objetosNuevaMochila.length > 0) {
          const ogImagePath = await generateOGImage(nuevaMochila[0], objetosNuevaMochila);
          await conn.query('UPDATE mochilas SET og_image_url = ? WHERE id = ?', [ogImagePath, nuevaMochilaId]);
        }
      } catch (ogErr) {
        console.error('Error generando imagen OG para mochila clonada:', ogErr);
        // No fallar la operación principal si la imagen OG falla
      }

      res.status(201).json({
        id: nuevaMochilaId,
        codigo: nuevoCodigo,
        nombre: nuevoNombre,
        descripcion: original.descripcion,
        tiene_edit_password: original.edit_password_hash ? true : false,
        is_private: original.is_private ? true : false,
        message: 'Mochila clonada exitosamente'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  }
};

module.exports = mochilasController;
