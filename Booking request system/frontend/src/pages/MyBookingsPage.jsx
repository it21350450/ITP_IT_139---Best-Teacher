import React, { useEffect, useState } from 'react';
import { Typography, Box, Tabs, Tab, CircularProgress, Chip, Badge } from '@mui/material';
import { useBooking } from '../context/BookingContext';
import BookingList from '../components/bookings/BookingList';
import { AccessTime, CheckCircleOutline, CancelOutlined, DoneAllOutlined, ViewList } from '@mui/icons-material';

const MyBookingsPage = ({ injectedRole }) => {
  const { fetchBookings, loading, bookings } = useBooking();
  const [tabIndex, setTabIndex] = useState(0);

  const statusMap = {
    0: '',          // All
    1: 'pending',
    2: 'confirmed',
    3: 'completed',
    4: 'cancelled'
  };

  useEffect(() => {
    fetchBookings({ status: statusMap[tabIndex], limit: 20 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex, injectedRole]); // Refetch if role or tab changes

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64, // Taller tabs for premium feel
              fontSize: '0.95rem',
              fontWeight: 500,
            }
          }}
        >
          <Tab icon={<ViewList fontSize="small" />} iconPosition="start" label="All Bookings" />
          <Tab icon={<AccessTime fontSize="small" />} iconPosition="start" label="Pending" />
          <Tab icon={<CheckCircleOutline fontSize="small" />} iconPosition="start" label="Confirmed" />
          <Tab icon={<DoneAllOutlined fontSize="small" />} iconPosition="start" label="Completed" />
          <Tab icon={<CancelOutlined fontSize="small" />} iconPosition="start" label="Cancelled" />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" my={8}>
          <CircularProgress size={48} thickness={4} />
          <Typography color="textSecondary" sx={{ mt: 2 }}>Syncing schedule...</Typography>
        </Box>
      ) : (
        <BookingList userRole={injectedRole} />
      )}
    </Box>
  );
};

export default MyBookingsPage;
