import api from './api';

export const getEventAnalytics = async (eventId) => {
    const { data } = await api.get(`/analytics/event/${eventId}`);
    return data;
};

export const getOverallAnalytics = async () => {
    const { data } = await api.get('/analytics/overall');
    return data;
};

export const getCoordinatorAnalytics = async (coordinatorId) => {
    const { data } = await api.get(`/analytics/coordinator/${coordinatorId}`);
    return data;
};
