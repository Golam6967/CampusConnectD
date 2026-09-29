import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth headers if user is logged in
const getAuthHeaders = () => {
    const token = sessionStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const submitFeedback = (data) =>
    axios.post(`${API_BASE}/feedback`, data, { headers: getAuthHeaders() });

export const getAllFeedback = () =>
    axios.get(`${API_BASE}/feedback`);

export const getFeedbackByCategory = (category) =>
    axios.get(`${API_BASE}/feedback/category/${category}`);

export const getFeedbackById = (id) =>
    axios.get(`${API_BASE}/feedback/${id}`);

export const addComment = (feedbackId, data) =>
    axios.post(`${API_BASE}/feedback/${feedbackId}/comments`, data, { headers: getAuthHeaders() });

export const deleteComment = (feedbackId, commentId) =>
    axios.delete(`${API_BASE}/feedback/${feedbackId}/comments/${commentId}`);

export const likeFeedback = (feedbackId, userId) =>
    axios.post(`${API_BASE}/feedback/${feedbackId}/like`, { userId }, { headers: getAuthHeaders() });

export const unlikeFeedback = (feedbackId, userId) =>
    axios.post(`${API_BASE}/feedback/${feedbackId}/unlike`, { userId }, { headers: getAuthHeaders() });

export const likeComment = (feedbackId, commentId, userId) =>
    axios.post(`${API_BASE}/feedback/${feedbackId}/comments/${commentId}/like`, { userId });

export const unlikeComment = (feedbackId, commentId, userId) =>
    axios.post(`${API_BASE}/feedback/${feedbackId}/comments/${commentId}/unlike`, { userId });
