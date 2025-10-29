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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

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
        p: 2,
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
            color: "#222",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: BLUE, width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              sx={{
                mb: 0.5,
                color: BLUE,
              }}
            >
              Student Management
            </Typography>
          </Box>
          <Typography
            variant="subtitle1"
            align="center"
            color="#223a5e"
            mb={3}
          >
            Login to your account
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
                "& .MuiOutlinedInput-root": { borderRadius: 2 }
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
                "& .MuiOutlinedInput-root": { borderRadius: 2 }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.3,
                fontWeight: "bold",
                fontSize: "1rem",
                borderRadius: 2,
                bgcolor: BLUE,
                color: "#fff",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#003c8f",
                  transform: "translateY(-2px)",
                },
              }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Typography align="center" sx={{ mt: 1, color: "#333" }}>
              Don’t have an account?{" "}
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
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
