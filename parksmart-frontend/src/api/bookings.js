import api from './axiosConfig';

// Create new booking
export const createBooking = async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

// Get my bookings
export const getMyBookings = async () => {
    const response = await api.get('/bookings/my');
    return response.data;
};

// Get all bookings (admin only)
export const getAllBookings = async () => {
    const response = await api.get('/bookings/all');
    return response.data;
};

// Update booking status
export const updateBookingStatus = async (id, status) => {
    const response = await api.put(`/bookings/${id}`, { status });
    return response.data;
};
