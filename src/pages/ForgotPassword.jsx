import { useState } from "react";
import { Container, Paper, TextField, Button, Typography, Box, Alert, Avatar } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import API from "../api/axios";

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/forgot-password/", { email });
      setMessage("Password reset link sent! Check your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email");
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
              <MailOutlineIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color={BLUE}>
              Forgot Password
            </Typography>
          </Box>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Enter your registered email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, bgcolor: BLUE, "&:hover": { bgcolor: "#003c8f" } }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
