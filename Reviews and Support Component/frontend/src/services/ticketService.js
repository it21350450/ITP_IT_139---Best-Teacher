import axios from 'axios';

const API_URL = '/api/tickets';

const createTicket = async (ticketData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(API_URL, ticketData, config);
    return response.data;
};

const getStudentTickets = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.get(`${API_URL}/student`, config);
    return response.data;
};

const getTeacherTickets = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.get(`${API_URL}/teacher`, config);
    return response.data;
};

const getAdminTickets = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.get(`${API_URL}/admin`, config);
    return response.data;
};

const getTicketDetails = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
};

const respondToTicket = async (id, message, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(`${API_URL}/${id}/respond`, { message }, config);
    return response.data;
};

const updateTicketStatus = async (id, status, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, config);
    return response.data;
};

const deleteTicket = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const updateTicket = async (id, ticketData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.put(`${API_URL}/${id}`, ticketData, config);
    return response.data;
};

const ticketService = {
    createTicket,
    getStudentTickets,
    getTeacherTickets,
    getAdminTickets,
    getTicketDetails,
    respondToTicket,
    updateTicketStatus,
    updateTicket,
    deleteTicket
};

export default ticketService;
