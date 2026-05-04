import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Divider,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
} from '@mui/material';
import { School, Person, Note, TaskAlt, EventBusy, Edit } from '@mui/icons-material';
import BookingStatusBadge from './BookingStatusBadge';
import ConfirmationModal from './ConfirmationModal';
import BookingRequestForm from './BookingRequestForm';
import { useBooking } from '../../context/BookingContext';

// Helper logic for local times
const formatLocalTime = (dateString, timeString) => {
  return new Date(`${dateString.split('T')[0]}T${timeString}:00`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const BookingList = ({ userRole }) => {
  const { bookings, changeBookingStatus } = useBooking();
  const [modalConfig, setModalConfig] = useState({ open: false, type: null, booking: null });
  const [editBookingData, setEditBookingData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';

  const handleActionClick = (type, booking) => setModalConfig({ open: true, type, booking });
  const handleCloseModal = () => setModalConfig({ open: false, type: null, booking: null });
  const handleEditClick = (booking) => setEditBookingData(booking);

  const handleConfirmAction = async (reason = null) => {
    setActionLoading(true);
    const { type, booking } = modalConfig;
    let targetStatus = '';
    let statusData = {};

    if (type === 'accept') targetStatus = 'confirmed';
    if (type === 'reject') {
      targetStatus = 'cancelled';
      statusData.cancellationReason = reason || 'Rejected by teacher';
    }
    if (type === 'cancel') {
      targetStatus = 'cancelled';
      statusData.cancellationReason = reason || 'Cancelled by student';
    }
    if (type === 'complete') targetStatus = 'completed';

    statusData.status = targetStatus;
    const result = await changeBookingStatus(booking._id, statusData);

    setActionLoading(false);
    handleCloseModal();

    if (result.success) {
      setAlertInfo({ open: true, message: `Action successful! Lesson is now ${targetStatus}.`, severity: 'success' });
    } else {
      setAlertInfo({ open: true, message: result.error, severity: 'error' });
    }
  };

  if (bookings.length === 0) {
    return (
      <Box p={6} textAlign="center" borderRadius={4} bgcolor="#f4f6f8" border="1px dashed #cfd8dc">
        <EventBusy sx={{ fontSize: 64, color: '#b0bec5', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" fontWeight="bold">No Lesson Requested Here</Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          {isStudent ? 'When you request a new lesson, it will appear in your schedule list here.' : 'You have no incoming lesson requests waiting.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {bookings.map((b) => (
          <Grid item xs={12} md={6} lg={4} key={b._id}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                borderColor: b.status === 'pending' ? '#ffd54f' : '#e0e0e0',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(149, 157, 165, 0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                
                {/* Header (Status & Date) */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                  <BookingStatusBadge status={b.status} />
                  <Typography variant="caption" color="textSecondary" fontWeight="500">
                    Requested on {new Date(b.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                {/* Time Profile */}
                <Typography variant="h5" fontWeight="800" color="textPrimary" mb={0.5}>
                  {new Date(b.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Typography>
                <Typography variant="subtitle1" color="primary.main" fontWeight="700" mb={3}>
                  {formatLocalTime(b.date, b.startTime)} — {formatLocalTime(b.date, b.endTime)}
                </Typography>

                {/* Users Interface */}
                <Box display="flex" alignItems="center" gap={1.5} mb={2} p={1.5} bgcolor="#f8f9fa" borderRadius={2}>
                  <Avatar sx={{ bgcolor: isStudent ? '#e3f2fd' : '#fce4ec', width: 36, height: 36 }}>
                    {isStudent ? <School color="primary" fontSize="small" /> : <Person color="secondary" fontSize="small" />}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                      {isStudent ? 'Teacher' : 'Student'}
                    </Typography>
                    <Typography variant="body2" fontWeight="600" color="textPrimary">
                      {isStudent ? b.teacherId?.name || "Teacher Profile" : b.studentId?.name || "Student Profile"}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Custom Message Container */}
                {b.message && (
                  <Box display="flex" gap={1} mt={2}>
                    <Note fontSize="small" sx={{ color: '#90a4ae', mt: 0.5 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{b.message}"
                    </Typography>
                  </Box>
                )}

                {/* Cancelation Reason Box */}
                {b.cancellationReason && b.status === 'cancelled' && (
                  <Box mt={2} p={1.5} bgcolor="#fff5f5" borderRadius={2} border="1px solid #ffebee">
                    <Typography variant="caption" color="error" fontWeight="bold" display="block" mb={0.5}>
                      Cancellation Reason:
                    </Typography>
                    <Typography variant="body2" color="error">
                      {b.cancellationReason}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <Divider />

              {/* Intuitive Action Interface Panel */}
              <Box p={2} bgcolor="#fafbfc" display="flex" gap={1} justifyContent="flex-end" alignItems="center">
                
                {/* --- TEACHER ACTIONS --- */}
                {b.status === 'pending' && isTeacher && (
                  <>
                    <Typography variant="caption" color="warning.main" fontWeight="bold" sx={{ mr: 'auto', pl: 1 }}>
                      Awaiting your approval!
                    </Typography>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleActionClick('reject', b)} sx={{ borderRadius: 8 }}>
                      Reject
                    </Button>
                    <Button size="small" variant="contained" color="success" disableElevation onClick={() => handleActionClick('accept', b)} sx={{ borderRadius: 8 }}>
                      Accept Lesson
                    </Button>
                  </>
                )}
                
                {/* --- STUDENT ACTIONS --- */}
                {b.status === 'pending' && isStudent && (
                  <>
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 'auto', pl: 1 }}>
                       Waiting for teacher to accept...
                    </Typography>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<Edit />}
                      onClick={() => handleEditClick(b)}
                      sx={{ borderRadius: 8 }}
                    >
                      Edit
                    </Button>
                    <Button size="small" variant="text" color="error" onClick={() => handleActionClick('cancel', b)}>
                      Withdraw
                    </Button>
                  </>
                )}

                {/* --- CONFIRMED ACTIONS (For both) --- */}
                {b.status === 'confirmed' && (
                  <>
                    {/* Mark Complete is usually done by teacher or student post-lesson. This is simplified here. */}
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary" 
                      disableElevation 
                      startIcon={<TaskAlt />}
                      onClick={() => handleActionClick('complete', b)}
                      sx={{ borderRadius: 8, mr: 'auto' }}
                    >
                      Log as Complete
                    </Button>

                    <Button size="small" variant="outlined" color="error" onClick={() => handleActionClick('cancel', b)} sx={{ borderRadius: 8 }}>
                      Cancel
                    </Button>
                  </>
                )}

                {/* Passive states (just layout cleanup) */}
                {(b.status === 'cancelled' || b.status === 'completed') && (
                  <Typography variant="button" color="textSecondary" sx={{ width: '100%', textAlign: 'center', py: 0.5 }}>
                    {b.status === 'completed' ? 'Lesson Finished' : 'Lesson Cancelled'}
                  </Typography>
                )}

              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Intelligent Action Modals */}
      <ConfirmationModal
        open={modalConfig.open && modalConfig.type === 'accept'}
        title="Approve Lesson Request"
        text={
          `Are you sure you want to commit to teaching this lesson on ${modalConfig.booking ? new Date(modalConfig.booking.date).toLocaleDateString() : ''}?`
        }
        loading={actionLoading}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
      />

      <ConfirmationModal
        open={modalConfig.open && (modalConfig.type === 'reject' || modalConfig.type === 'cancel')}
        title={modalConfig.type === 'reject' ? 'Decline Lesson' : 'Cancel My Lesson'}
        text={
          modalConfig.type === 'reject' 
          ? 'Please provide a short reason for declining this request so the student understands. (e.g. Schedule clash)' 
          : 'Are you sure you need to cancel this lesson? Please provide a reason.'
        }
        requiresReason={true}
        loading={actionLoading}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
      />

      <ConfirmationModal
        open={modalConfig.open && modalConfig.type === 'complete'}
        title="Lesson Successfully Completed?"
        text="Only mark this as complete if the lesson actually took place and finished."
        loading={actionLoading}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
      />

      <Dialog 
        open={!!editBookingData} 
        onClose={() => setEditBookingData(null)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {editBookingData && (
            <BookingRequestForm 
              teacherId={editBookingData.teacherId?._id || editBookingData.teacherId} 
              initialData={editBookingData}
              onClose={() => setEditBookingData(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={alertInfo.open} 
        autoHideDuration={4000} 
        onClose={() => setAlertInfo({ ...alertInfo, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={alertInfo.severity} variant="filled" sx={{ width: '100%', borderRadius: 3, boxShadow: 3 }}>
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingList;
