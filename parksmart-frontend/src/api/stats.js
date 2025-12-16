import api from './axiosConfig';

export const getDashboardStats = async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
};

// Get recent activity
export const getRecentActivity = async () => {
    const response = await api.get('/analytics/activity');
    return response.data;
};
