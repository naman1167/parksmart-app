import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create reservation
export const createReservation = async (reservationData) => {
    const response = await axios.post(`${API_URL}/reservations`, reservationData);
    return response.data;
};

// Get user's reservations
export const getUserReservations = async (params = {}) => {
    const response = await axios.get(`${API_URL}/reservations/my`, { params });
    return response.data;
};

// Get reservation by ID
export const getReservationById = async (id) => {
    const response = await axios.get(`${API_URL}/reservations/${id}`);
    return response.data;
};

// Cancel reservation
export const cancelReservation = async (id) => {
    const response = await axios.delete(`${API_URL}/reservations/${id}`);
    return response.data;
};

// Check in to reservation
export const checkInReservation = async (id) => {
    const response = await axios.put(`${API_URL}/reservations/${id}/checkin`);
    return response.data;
};
