import api from './axiosConfig';

export const createSwapRequest = (data) => api.post('/swap', data);
export const getNearbySwaps = (params) => api.get('/swap/nearby', { params });
export const matchSwapRequest = (id) => api.post(`/swap/${id}/match`);
export const completeSwap = (id) => api.post(`/swap/${id}/complete`);
