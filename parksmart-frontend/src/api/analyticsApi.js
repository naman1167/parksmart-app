import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get analytics data
export const getRevenueAnalytics = async (params = {}) => {
    const response = await axios.get(`${API_URL}/analytics/revenue`, { params });
    return response.data;
};

export const getBookingsAnalytics = async () => {
    const response = await axios.get(`${API_URL}/analytics/bookings`);
    return response.data;
};

export const getOccupancyAnalytics = async () => {
    const response = await axios.get(`${API_URL}/analytics/occupancy`);
    return response.data;
};

export const getHourlyTraffic = async (params = {}) => {
    const response = await axios.get(`${API_URL}/analytics/traffic`, { params });
    return response.data;
};

export const getUserStats = async (params = {}) => {
    const response = await axios.get(`${API_URL}/analytics/users`, { params });
    return response.data;
};
