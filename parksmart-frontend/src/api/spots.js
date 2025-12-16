import api from './axiosConfig';

// Get all parking spots
export const getAllSpots = async (params) => {
    const response = await api.get('/spots', { params });
    return response.data;
};

// Get available spots only
export const getAvailableSpots = async () => {
    const response = await api.get('/spots/available');
    return response.data;
};

// Get single spot by ID
export const getSpotById = async (id) => {
    const response = await api.get(`/spots/${id}`);
    return response.data;
};

// Create new parking spot (admin only)
export const createSpot = async (spotData) => {
    const response = await api.post('/spots', spotData);
    return response.data;
};

// Update parking spot (admin only)
export const updateSpot = async (id, spotData) => {
    const response = await api.put(`/spots/${id}`, spotData);
    return response.data;
};

// Delete parking spot (admin only)
export const deleteSpot = async (id) => {
    const response = await api.delete(`/spots/${id}`);
    return response.data;
};
