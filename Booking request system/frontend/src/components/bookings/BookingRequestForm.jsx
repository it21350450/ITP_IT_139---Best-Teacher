import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  Paper, 
  Grid,
  InputAdornment,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { CalendarToday, AccessTime, Comment, Send } from '@mui/icons-material';
import { useBooking } from '../../context/BookingContext';

const BookingRequestForm = ({ teacherId, onClose, onBack, initialData = null }) => {
  const { submitBooking, editBooking, error: contextError } = useBooking();

  const [date, setDate] = useState(initialData ? initialData.date.split('T')[0] : '');
  const [startTime, setStartTime] = useState(initialData ? initialData.startTime : '');
  const [endTime, setEndTime] = useState(initialData ? initialData.endTime : '');
  const [message, setMessage] = useState(initialData ? initialData.message || '' : '');
  
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = !!initialData;

  const validateForm = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const selectedDate = new Date(date);
    
    if (!date) return "Please pick a date for your lesson.";
    
    if (selectedDate < today) {
      return "You cannot book a date in the past. Please select a future date.";
    }

    if (!startTime || !endTime) {
      return "Please select both a start and end time.";
    }

    if (endTime <= startTime) {
      return "The end time must be after the start time.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLoading(true);
    let result;
    if (isEdit) {
      result = await editBooking(initialData._id, {
        date,
        startTime,
        endTime,
        message,
      });
    } else {
      result = await submitBooking({
        teacherId,
        date,
        startTime,
        endTime,
        message,
      });
    }

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, bgcolor: '#fafbfc' }}>
      
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" color="textPrimary" gutterBottom>
          {isEdit ? 'Update Your Lesson' : 'Schedule a Lesson'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {isEdit 
            ? 'Adjust your request details below. Once updated, the teacher will see the changes.' 
            : 'Pick an available date and time below to send a request to your teacher.'}
        </Typography>
      </Box>

      {/* Progress visually explaining what is happening */}
      {!isEdit && (
        <Box mb={5} display={{ xs: 'none', sm: 'block' }}>
          <Stepper activeStep={1} alternativeLabel>
            <Step completed onClick={onBack} sx={{ cursor: 'pointer' }}><StepLabel>Choose Teacher</StepLabel></Step>
            <Step active><StepLabel>Pick Time & Request</StepLabel></Step>
            <Step><StepLabel>Teacher Approval</StepLabel></Step>
          </Stepper>
        </Box>
      )}

      {localError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{localError}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{isEdit ? 'Success! Booking updated.' : 'Awesome! Your lesson request was sent to the teacher.'}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Select Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                required
                InputLabelProps={{ shrink: true }}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTime color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'white' }}
              />

              <TextField
                fullWidth
                label="End Time"
                type="time"
                required
                InputLabelProps={{ shrink: true }}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                sx={{ bgcolor: 'white' }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="textSecondary">
            Message to Teacher (Optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="E.g., I would like to review Chapter 4 on fractions."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            inputProps={{ maxLength: 500 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <Comment color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'white' }}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={2}>
            <Button 
              color="inherit" 
              onClick={onClose}
              disabled={loading || success}
            >
              Cancel
            </Button>
            {!isEdit && onBack && (
              <Button 
                color="secondary" 
                onClick={onBack}
                disabled={loading || success}
                variant="outlined"
                sx={{ borderRadius: 8 }}
              >
                Back to Teachers
              </Button>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || success}
            endIcon={<Send />}
            sx={{ px: 5, py: 1.5, borderRadius: 8, boxShadow: 3 }}
          >
            {loading ? (isEdit ? 'Updating...' : 'Sending Request...') : (isEdit ? 'Update Booking' : 'Send Booking Request')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookingRequestForm;
