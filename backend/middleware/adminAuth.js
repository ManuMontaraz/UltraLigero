const adminAuth = (req, res, next) => {
  // Intentar obtener password de varias fuentes
  let password = req.body?.password || 
                 req.headers['x-admin-password'];
  
  // Verificar si isAdmin viene en el body (desde el frontend)
  const isAdminFlag = req.body?.isAdmin;
  
  // Si isAdmin es true (booleano o string), permitir
  if (isAdminFlag === true || isAdminFlag === 'true') {
    req.isAdmin = true;
    return next();
  }
  
  // Si hay password, verificarlo
  if (password) {
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Contraseña de administrador incorrecta' });
    }
    
    // Inyectar isAdmin para que los controladores sepan que es admin
    req.isAdmin = true;
    req.adminPassword = password;
    return next();
  }
  
  // Si no hay ni isAdmin ni password, requerir autenticación
  return res.status(401).json({ error: 'Se requiere contraseña de administrador' });
};

module.exports = adminAuth;
