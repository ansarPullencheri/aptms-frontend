import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; //  (useLocation added)
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  Avatar 
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import API from "../api/axios";

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const ResetPassword = () => {
  //  get uidb64 and token from query parameters instead of params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uidb64 = queryParams.get("uidb64");
  const token = queryParams.get("token");

  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      //  — send uidb64 and token to backend
      await API.post("/auth/reset-password/", {
        uidb64,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: LIGHT_BLUE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "#fff",
            border: `1.5px solid ${BLUE}`,
            boxShadow: "0 8px 32px rgba(21,101,192,0.08)",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ m: 1, bgcolor: BLUE, width: 56, height: 56 }}>
              <LockResetIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color={BLUE}>
              Reset Password
            </Typography>
          </Box>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, bgcolor: BLUE, "&:hover": { bgcolor: "#003c8f" } }}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
