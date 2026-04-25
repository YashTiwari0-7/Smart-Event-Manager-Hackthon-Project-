const ROLES = {
    ADMIN: 'admin',
    COORDINATOR: 'coordinator',
    PARTICIPANT: 'participant'
};

const REGISTRATION_ROLES = [ROLES.COORDINATOR, ROLES.PARTICIPANT];

const getMasterAdmin = () => ({
    id: process.env.ADMIN_ID || '000000000000000000000001',
    name: process.env.ADMIN_NAME || 'Master Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: ROLES.ADMIN,
    isApproved: true
});

const isMasterAdminConfigured = () => {
    const masterAdmin = getMasterAdmin();

    return Boolean(masterAdmin.email && masterAdmin.password);
};

module.exports = {
    getMasterAdmin,
    isMasterAdminConfigured,
    ROLES,
    REGISTRATION_ROLES
};
