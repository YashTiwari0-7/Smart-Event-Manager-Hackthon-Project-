const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { getMasterAdmin, isMasterAdminConfigured, ROLES } = require('../utils/authConstants');

const verifyToken = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const masterAdmin = getMasterAdmin();

        if (
            isMasterAdminConfigured()
            && decoded.id === masterAdmin.id
            && decoded.role === masterAdmin.role
        ) {
            req.user = {
                _id: masterAdmin.id,
                name: masterAdmin.name,
                email: masterAdmin.email,
                role: masterAdmin.role,
                isApproved: masterAdmin.isApproved
            };

            return next();
        }

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new AppError('Not authorized, user not found', 401);
        }

        if (user.role === ROLES.COORDINATOR && !user.isApproved) {
            throw new AppError('Coordinator not approved by admin yet', 403);
        }

        req.user = user;

        return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(new AppError('Not authorized, token failed', 401));
        }

        return next(error);
    }
};

module.exports = verifyToken;
