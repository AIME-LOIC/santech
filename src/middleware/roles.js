
export const requireRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
