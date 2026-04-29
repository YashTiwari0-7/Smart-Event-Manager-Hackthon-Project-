import api from './api';

export const getAvailableEvents = async () => {
    const { data } = await api.get('/participant/events');
    return data;
};

export const getMyEvents = async () => {
    const { data } = await api.get('/participant/my-events');
    return data;
};

export const getAchievements = async () => {
    const { data } = await api.get('/participant/achievements');
    return data;
};

export const registerForEvent = async (eventId) => {
    const { data } = await api.post(`/participant/event/${eventId}/register`);
    return data;
};

export const withdrawFromEvent = async (eventId) => {
    const { data } = await api.post(`/participant/event/${eventId}/withdraw`);
    return data;
};

export const createTeam = async (eventId, teamName) => {
    // If teamName is empty or undefined, the backend handles creating a default one
    const { data } = await api.post(`/participant/event/${eventId}/team/create`, { teamName });
    return data;
};

export const joinTeam = async (eventId, invitationCode) => {
    const { data } = await api.post(`/participant/event/${eventId}/team/join`, { invitationCode });
    return data;
};

export const leaveTeam = async (eventId) => {
    const { data } = await api.post(`/participant/event/${eventId}/team/leave`);
    return data;
};

export const removeTeamMember = async (eventId, memberId) => {
    const { data } = await api.post(`/participant/event/${eventId}/team/remove-member`, { memberId });
    return data;
};

export const updateTeamName = async (eventId, teamName) => {
    const { data } = await api.post(`/participant/event/${eventId}/team/update-name`, { teamName });
    return data;
};

export const getMyCertificates = async () => {
    const { data } = await api.get('/participant/certificates');
    return data;
};

export const getHistory = async () => {
    const { data } = await api.get('/participant/history');
    return data;
};

export const downloadCertificate = async (eventId, type) => {
    const response = await api.get(`/participant/certificate/${eventId}/${type}`, {
        responseType: 'blob'
    });
    return response.data;
};
