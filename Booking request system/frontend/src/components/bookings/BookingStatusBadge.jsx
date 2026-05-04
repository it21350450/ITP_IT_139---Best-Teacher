import React from 'react';
import { Chip } from '@mui/material';
import { Pending, CheckCircle, Cancel, DoneAll } from '@mui/icons-material';

const BookingStatusBadge = ({ status }) => {
  const getStatusProps = () => {
    switch (status) {
      case 'pending':
        return { color: 'warning', icon: <Pending fontSize="small" />, label: 'Pending' };
      case 'confirmed':
        return { color: 'info', icon: <CheckCircle fontSize="small" />, label: 'Confirmed' };
      case 'completed':
        return { color: 'success', icon: <DoneAll fontSize="small" />, label: 'Completed' };
      case 'cancelled':
        return { color: 'error', icon: <Cancel fontSize="small" />, label: 'Cancelled' };
      default:
        return { color: 'default', icon: <Pending fontSize="small" />, label: 'Unknown' };
    }
  };

  const config = getStatusProps();

  return (
    <Chip
      label={config.label}
      color={config.color}
      icon={config.icon}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
    />
  );
};

export default BookingStatusBadge;
