const AppError = require('../utils/appError');

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('Access denied', 403));
        }

        next();
    };
};

module.exports = authorizeRoles;
