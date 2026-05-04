import React, { createContext, useReducer, useContext } from 'react';
import bookingService from '../services/bookingService';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        bookings: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_BOOKING_STATUS':
    case 'UPDATE_BOOKING_SUCCESS':
      return {
        ...state,
        bookings: state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        ),
      };
    case 'CREATE_BOOKING_SUCCESS':
      return {
        ...state,
        bookings: [action.payload, ...state.bookings],
      };
    default:
      return state;
  }
};

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const fetchBookings = async (params = {}) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await bookingService.getMyBookings(params);
      dispatch({ type: 'FETCH_SUCCESS', payload: response });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch bookings';
      dispatch({ type: 'FETCH_ERROR', payload: errorMsg });
    }
  };

  const changeBookingStatus = async (id, statusData) => {
    try {
      const response = await bookingService.updateBookingStatus(id, statusData);
      dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: response.data });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update status';
      return { success: false, error: errorMsg };
    }
  };

  const submitBooking = async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      dispatch({ type: 'CREATE_BOOKING_SUCCESS', payload: response.data });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to create booking';
      return { success: false, error: errorMsg };
    }
  };

  const editBooking = async (id, bookingData) => {
    try {
      const response = await bookingService.updateBooking(id, bookingData);
      dispatch({ type: 'UPDATE_BOOKING_SUCCESS', payload: response.data });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to update booking';
      return { success: false, error: errorMsg };
    }
  };

  return (
    <BookingContext.Provider
      value={{
        ...state,
        fetchBookings,
        changeBookingStatus,
        submitBooking,
        editBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
