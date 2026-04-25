import api from './api';

export const getAdminStats = async () => {
    const { data } = await api.get('/admin/stats');
    return data;
};

export const getAllEvents = async () => {
    const { data } = await api.get('/admin/events');
    return data;
};

export const getEventById = async (id) => {
    const { data } = await api.get(`/admin/event/${id}`);
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

export const getEventParticipants = async (id) => {
    const { data } = await api.get(`/admin/event/${id}/participants`);
    return data;
};

export const getAllCoordinators = async () => {
    const { data } = await api.get('/admin/coordinators');
    return data;
};

export const getPendingCoordinators = async () => {
    const { data } = await api.get('/admin/coordinators/pending');
    return data;
};

export const getApprovedCoordinators = async () => {
    const { data } = await api.get('/admin/coordinators/approved');
    return data;
};

export const getCoordinatorDetails = async (id) => {
    const { data } = await api.get(`/admin/coordinator/${id}`);
    return data;
};

export const createCoordinator = async (coordinatorData) => {
    const { data } = await api.post('/admin/coordinator/create', coordinatorData);
    return data;
};

export const approveCoordinator = async (id) => {
    const { data } = await api.put(`/admin/coordinator/approve/${id}`);
    return data;
};

export const deleteCoordinator = async (id) => {
    const { data } = await api.delete(`/admin/coordinator/${id}`);
    return data;
};
