import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get all slots
export const getAllSlots = async (params = {}) => {
    const response = await axios.get(`${API_URL}/slots`, { params });
    return response.data;
};

// Get slots by parking spot
export const getSlotsByParkingSpot = async (parkingSpotId) => {
    const response = await axios.get(`${API_URL}/slots/parking/${parkingSpotId}`);
    return response.data;
};

// Update slot status (admin/owner)
export const updateSlotStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/slots/${id}/status`, { status });
    return response.data;
};

// Create slot (admin/owner)
export const createSlot = async (slotData) => {
    const response = await axios.post(`${API_URL}/slots`, slotData);
    return response.data;
};
