import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@mui/material';

const ConfirmationModal = ({ open, title, text, requiresReason = false, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(requiresReason ? reason : null);
    setReason('');
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose}>
      <DialogTitle fontWeight="bold">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText mb={requiresReason ? 2 : 0}>
          {text}
        </DialogContentText>
        {requiresReason && (
          <TextField
            autoFocus
            margin="dense"
            label="Reason (Optional)"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Close
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color={requiresReason ? 'error' : 'primary'}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
