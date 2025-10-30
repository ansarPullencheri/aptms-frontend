import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, Alert, IconButton,
  InputAdornment, Chip
} from '@mui/material';
import { VpnKey, Visibility, VisibilityOff, ContentCopy, AutoAwesome } from '@mui/icons-material';
import API from '../api/axios';

const BLUE = "#1565c0";

const ResetPasswordDialog = ({ open, onClose, user, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleReset = () => {
    setNewPassword('');
    setGeneratedPassword('');
    setMessage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleGeneratePassword = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await API.post('/auth/admin/generate-password/', {
        user_id: user.id
      });

      setGeneratedPassword(response.data.new_password);
      setMessage({
        type: 'success',
        text: 'Password generated successfully! Copy it and share with the student.'
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to generate password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      await API.post('/auth/admin/reset-password/', {
        user_id: user.id,
        new_password: newPassword
      });

      setMessage({
        type: 'success',
        text: 'Password reset successfully!'
      });

      if (onSuccess) onSuccess();

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to reset password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setMessage({
      type: 'success',
      text: 'Password copied to clipboard!'
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <VpnKey />
          Reset Password
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* User Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>User:</strong> {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Username:</strong> {user.username}
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> {user.email}
          </Typography>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Option 1: Generate Random Password */}
        <Box sx={{ mb: 3, p: 2, border: '2px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: BLUE }}>
            Option 1: Generate Random Password
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            System will generate a secure 8-character password
          </Typography>

          {generatedPassword && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', flex: 1 }}>
                {generatedPassword}
              </Typography>
              <IconButton onClick={handleCopyPassword} size="small" sx={{ color: BLUE }}>
                <ContentCopy />
              </IconButton>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={handleGeneratePassword}
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: '#00897b',
              fontWeight: 600,
              '&:hover': { bgcolor: '#00695c' }
            }}
          >
            {generatedPassword ? 'Generate New' : 'Generate Password'}
          </Button>
        </Box>

        {/* Option 2: Manual Password */}
        <Box sx={{ p: 2, border: '2px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: BLUE }}>
            Option 2: Set Custom Password
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter a password manually (min 6 characters)
          </Typography>

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleManualReset}
            disabled={loading || !newPassword}
            sx={{
              mt: 2,
              bgcolor: BLUE,
              fontWeight: 600,
              '&:hover': { bgcolor: '#003c8f' }
            }}
          >
            Set Password
          </Button>
        </Box>

        {/* Warning */}
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Important:</strong> Make sure to share the new password with the student securely.
            They can change it later from their profile.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
