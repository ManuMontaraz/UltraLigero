const pool = require('../config/database');
const { convertBigInt } = require('../utils/serializer');

const gruposController = {
  // Obtener todos los grupos
  getAll: async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const grupos = await conn.query(
        'SELECT * FROM grupos ORDER BY orden, nombre'
      );

      const gruposFormatted = grupos.map(grupo => ({
        ...grupo,
        tiene_password: grupo.edit_password_hash ? true : false,
        edit_password_hash: undefined
      }));

      res.json(gruposFormatted);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

  // Obtener grupo por ID
  getById: async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      conn = await pool.getConnection();
      
      const grupos = await conn.query(
        'SELECT * FROM grupos WHERE id = ?',
        [id]
      );

      if (grupos.length === 0) {
        return res.status(404).json({ error: 'Grupo no encontrado' });
      }

      const grupo = grupos[0];
      grupo.tiene_password = grupo.edit_password_hash ? true : false;
      grupo.edit_password_hash = undefined;

      res.json(grupo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release();
    }
  },

};

module.exports = gruposController;
