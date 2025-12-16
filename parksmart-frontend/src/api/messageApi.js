import axios from './axiosConfig';

export const sendMessage = (data) => axios.post('/messages', data);
export const getMessages = (swapId) => axios.get(`/messages/${swapId}`);
