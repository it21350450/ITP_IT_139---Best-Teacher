import axios from 'axios';

const API_URL = '/api/reviews';

const createReview = async (reviewData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(API_URL, reviewData, config);
    return response.data;
};

const getTeacherReviews = async (teacherId) => {
    const response = await axios.get(`${API_URL}/teacher/${teacherId}`);
    return response.data;
};

const getTeacherSummary = async (teacherId) => {
    const response = await axios.get(`${API_URL}/teacher/${teacherId}/summary`);
    return response.data;
};

const deleteReview = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const reviewService = {
    createReview,
    getTeacherReviews,
    getTeacherSummary,
    deleteReview
};

export default reviewService;
