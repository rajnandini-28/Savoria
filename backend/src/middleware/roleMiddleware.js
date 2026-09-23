const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const userRole = req.user.role || 'customer';
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles`
            });
        }

        next();
    };
};

const requireAdmin = requireRole('admin');
const requireStaff = requireRole('admin', 'kitchen', 'delivery', 'concierge');

module.exports = {
    requireRole,
    requireAdmin,
    requireStaff
};
