const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');
const {
    getMasterAdmin,
    isMasterAdminConfigured,
    REGISTRATION_ROLES,
    ROLES
} = require('../utils/authConstants');

const buildAuthResponse = (user, includeToken = true) => {
    const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
    };

    if (includeToken) {
        response.token = generateToken(user._id, user.role);
    }

    return response;
};

const registerUser = async ({ name, email, password, role = ROLES.PARTICIPANT, gender }) => {
    if (!name || !email || !password) {
        throw new AppError('Name, email and password are required', 400);
    }

    if (!REGISTRATION_ROLES.includes(role)) {
        throw new AppError('Invalid role for registration', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const masterAdmin = getMasterAdmin();

    if (masterAdmin.email && normalizedEmail === String(masterAdmin.email).trim().toLowerCase()) {
        throw new AppError('This email is reserved', 400);
    }

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
        throw new AppError('User already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        gender
    });

    return buildAuthResponse(user, user.isApproved);
};

const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const masterAdmin = getMasterAdmin();
    const masterAdminEmail = masterAdmin.email ? String(masterAdmin.email).trim().toLowerCase() : null;

    if (masterAdminEmail && normalizedEmail === masterAdminEmail) {
        if (!isMasterAdminConfigured()) {
            throw new AppError('Admin credentials are not configured', 500);
        }

        if (String(password) !== String(masterAdmin.password)) {
            throw new AppError('Invalid email or password', 401);
        }

        return {
            _id: masterAdmin.id,
            name: masterAdmin.name,
            email: masterAdmin.email,
            role: masterAdmin.role,
            isApproved: masterAdmin.isApproved,
            token: generateToken(masterAdmin.id, masterAdmin.role)
        };
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(String(password), user.password))) {
        throw new AppError('Invalid email or password', 401);
    }

    if (user.role === ROLES.COORDINATOR && !user.isApproved) {
        throw new AppError('Coordinator not approved by admin yet', 403);
    }

    return buildAuthResponse(user);
};

module.exports = {
    registerUser,
    loginUser
};
