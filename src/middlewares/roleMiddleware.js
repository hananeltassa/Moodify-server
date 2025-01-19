export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: No user information' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }

    next();
  };
};