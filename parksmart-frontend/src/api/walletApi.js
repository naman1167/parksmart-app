import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get wallet info
export const getWalletInfo = async () => {
    const response = await axios.get(`${API_URL}/wallet`);
    return response.data;
};

// Get transaction history
export const getTransactionHistory = async (params = {}) => {
    const response = await axios.get(`${API_URL}/wallet/transactions`, { params });
    return response.data;
};

// Add money to wallet
export const addMoneyToWallet = async (amount) => {
    const response = await axios.post(`${API_URL}/wallet/add`, { amount });
    return response.data;
};

// Convert reward points
export const convertRewardPoints = async (points) => {
    const response = await axios.post(`${API_URL}/wallet/convert-points`, { points });
    return response.data;
};
