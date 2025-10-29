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
  Grid,
  Avatar,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      setSuccess("Registration successful! Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.error || "Registration failed");
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
      <Container maxWidth="md">
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
              <PersonAddAltIcon fontSize="large" />
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
              Student Registration
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            align="center"
            color="#223a5e"
            mb={3}
          >
            Create your student account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>

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
              {loading ? "Registering..." : "Register"}
            </Button>

            <Typography align="center" sx={{ color: "#333" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: BLUE,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
