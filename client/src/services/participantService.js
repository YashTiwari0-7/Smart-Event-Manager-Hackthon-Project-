import api from './api';

export const getAvailableEvents = async () => {
    const { data } = await api.get('/participant/events');
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
    const { data } = await api.post(`/participant/event/${eventId}/team/create`, { teamName });
    return data;
};

export const joinTeam = async (eventId, invitationCode) => {
    const { data } = await api.post(`/participant/event/${eventId}/team/join`, { invitationCode });
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
