import api from './api';

// Login (works for all roles — admin uses master credentials from .env)
export const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

// Participant registration — Step 1: request OTP
export const registerParticipant = async (formData) => {
    const { data } = await api.post('/participant/register', formData);
    return data;
};

// Participant registration — Step 2: verify OTP
export const verifyParticipantOtp = async (email, otp) => {
    const { data } = await api.post('/participant/verify-otp', { email, otp });
    return data;
};

// Coordinator registration — Step 1: request OTP
export const registerCoordinator = async (formData) => {
    const { data } = await api.post('/coordinator/register', formData);
    return data;
};

// Coordinator registration — Step 2: verify OTP
export const verifyCoordinatorOtp = async (email, otp) => {
    const { data } = await api.post('/coordinator/verify-otp', { email, otp });
    return data;
};

// Password Reset — Step 1: request OTP
export const requestPasswordReset = async (email) => {
    const { data } = await api.post('/password-reset/request', { email });
    return data;
};

// Password Reset — Step 2: verify OTP
export const verifyPasswordResetOtp = async (email, otp) => {
    const { data } = await api.post('/password-reset/verify-otp', { email, otp });
    return data;
};

// Password Reset — Step 3: set new password
export const resetPassword = async (email, otp, newPassword) => {
    const { data } = await api.post('/password-reset/reset', { email, otp, newPassword });
    return data;
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Get token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};
