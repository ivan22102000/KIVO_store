// Authentication middleware - validates JWT tokens and admin permissions
const { supabase, supabaseAdmin } = require('../lib/supabase.cjs');

// Middleware to validate JWT token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido',
        message: 'Debes incluir un token Bearer válido en el header Authorization' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token proporcionado no es válido o ha expirado' 
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('auth_uid', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ 
        error: 'Perfil de usuario no encontrado',
        message: 'No se encontró el perfil asociado a este usuario' 
      });
    }

    // Attach user and profile to request
    req.user = user;
    req.profile = profile;
    
    next();
  } catch (error) {
    console.error('Error en validación de auth:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al validar la autenticación' 
    });
  }
};

// Middleware to require admin permissions
const requireAdmin = async (req, res, next) => {
  try {
    // First validate authentication
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is admin
    if (!req.profile || !req.profile.is_admin) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        message: 'Esta operación requiere permisos de administrador' 
      });
    }

    next();
  } catch (error) {
    console.error('Error en validación de admin:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al validar permisos de administrador' 
    });
  }
};

// Middleware to optionally validate authentication (for mixed public/private routes)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth header provided - continue as guest
      req.user = null;
      req.profile = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // Try to validate token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      // Invalid token - continue as guest
      req.user = null;
      req.profile = null;
      return next();
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('auth_uid', user.id)
      .single();

    // Attach user and profile if found
    req.user = user;
    req.profile = profile || null;
    
    next();
  } catch (error) {
    console.error('Error en auth opcional:', error);
    // On error, continue as guest
    req.user = null;
    req.profile = null;
    next();
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
};
