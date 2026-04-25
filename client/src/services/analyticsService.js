import api from './api';

export const getEventAnalytics = async (eventId) => {
    const { data } = await api.get(`/analytics/event/${eventId}`);
    return data;
};
