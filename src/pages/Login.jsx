import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const BLUE = "#1976d2";
const LIGHT_BLUE = "#f4f7fb";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "mentor") navigate("/mentor/dashboard");
      else if (user.role === "student") navigate("/student/dashboard");
    } catch (err) {
      setError(err.error || "Invalid credentials");
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
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left Side - Illustration / Branding */}
          <Box
            sx={{
              flex: 1,
              bgcolor: BLUE,
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              p: { xs: 4, sm: 5 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "white",
                color: BLUE,
                width: 70,
                height: 70,
                mb: 2,
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Student Management System
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 300 }}>
              Secure login to manage your profile, courses, and progress.
            </Typography>
          </Box>

          {/* Right Side - Login Form */}
          <Box
            sx={{
              flex: 1.2,
              p: { xs: 3, sm: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="600"
              color={BLUE}
              align="center"
              gutterBottom
            >
              Welcome Back 👋
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
              mb={3}
            >
              Login to continue
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />

              {/* Forgot Password */}
              <Typography align="right" sx={{ mt: 1 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: BLUE,
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </Link>
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.4,
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: 2,
                  bgcolor: BLUE,
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "#004ba0",
                    boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography align="center" sx={{ color: "#333" }}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: BLUE,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Register as Student
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
