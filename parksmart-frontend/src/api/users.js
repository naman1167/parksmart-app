import api from './axiosConfig';

// Get all users (admin only)
export const getAllUsers = async () => {
    const response = await api.get('/auth/users');
    return response.data;
};
