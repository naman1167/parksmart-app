import api from './axiosConfig';

export const createPanicRequest = (data) => api.post('/panic', data);
export const getActivePanicRequests = () => api.get('/panic/active');
export const resolvePanicRequest = (id, data) => api.patch(`/panic/${id}/resolve`, data);
