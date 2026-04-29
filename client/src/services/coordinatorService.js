import api from './api';

export const getCoordinatorStats = async () => {
    const { data } = await api.get('/coordinator/stats');
    return data;
};

export const getAssignedEvents = async () => {
    const { data } = await api.get('/coordinator/events');
    return data;
};

export const getAssignedEventById = async (id) => {
    const { data } = await api.get(`/coordinator/event/${id}`);
    return data;
};

export const configureEvent = async (id, configData) => {
    const { data } = await api.put(`/coordinator/event/${id}/config`, configData);
    return data;
};

export const getEventParticipants = async (id) => {
    const { data } = await api.get(`/coordinator/event/${id}/participants`);
    return data;
};

export const getEventTeams = async (id) => {
    const { data } = await api.get(`/coordinator/event/${id}/teams`);
    return data;
};

export const endRegistration = async (id) => {
    const { data } = await api.post(`/coordinator/event/${id}/end-registration`);
    return data;
};

export const startEvent = async (id) => {
    const { data } = await api.post(`/coordinator/event/${id}/start`);
    return data;
};

export const getAttendance = async (id) => {
    const { data } = await api.get(`/coordinator/event/${id}/attendance`);
    return data;
};

export const markAttendance = async (id, userIds) => {
    const { data } = await api.post(`/coordinator/event/${id}/attendance`, { userIds });
    return data;
};

export const endEvent = async (id) => {
    const { data } = await api.post(`/coordinator/event/${id}/end`);
    return data;
};

export const saveResult = async (id, resultData) => {
    const { data } = await api.post(`/coordinator/event/${id}/result`, resultData);
    return data;
};

export const generateCertificates = async (id) => {
    const { data } = await api.post(`/coordinator/event/${id}/generate-certificates`);
    return data;
};

export const exportParticipationList = async (id, format = 'csv') => {
    const response = await api.get(`/coordinator/event/${id}/export?format=${format}`, {
        responseType: 'blob'
    });
    return response.data;
};
