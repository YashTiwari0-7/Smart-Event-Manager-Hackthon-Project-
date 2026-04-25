import api from './api';

export const getAllEvents = async () => {
    const { data } = await api.get('/admin/events');
    return data;
};

export const createEvent = async (eventData) => {
    const { data } = await api.post('/admin/event', eventData);
    return data;
};

export const updateEvent = async (id, eventData) => {
    const { data } = await api.put(`/admin/event/${id}`, eventData);
    return data;
};

export const deleteEvent = async (id) => {
    const { data } = await api.delete(`/admin/event/${id}`);
    return data;
};

export const getPendingCoordinators = async () => {
    const { data } = await api.get('/admin/coordinators/pending');
    return data;
};

export const approveCoordinator = async (id) => {
    const { data } = await api.put(`/admin/coordinator/approve/${id}`);
    return data;
};
