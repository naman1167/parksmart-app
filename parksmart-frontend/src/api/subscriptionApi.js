import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Purchase subscription
export const purchaseSubscription = async (plan, autoRenew = false) => {
    const response = await axios.post(`${API_URL}/subscriptions`, { plan, autoRenew });
    return response.data;
};

// Get user's subscription
export const getMySubscription = async () => {
    const response = await axios.get(`${API_URL}/subscriptions/my`);
    return response.data;
};

// Cancel subscription
export const cancelSubscription = async (id) => {
    const response = await axios.delete(`${API_URL}/subscriptions/${id}`);
    return response.data;
};

// Toggle auto-renew
export const toggleAutoRenew = async (id) => {
    const response = await axios.put(`${API_URL}/subscriptions/${id}/autorenew`);
    return response.data;
};

// Check subscription discount
export const checkSubscriptionDiscount = async () => {
    const response = await axios.get(`${API_URL}/subscriptions/check-discount`);
    return response.data;
};
