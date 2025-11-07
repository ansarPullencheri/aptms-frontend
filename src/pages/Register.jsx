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
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Divider,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const BLUE = "#1976d2";
const LIGHT_BLUE = "#f4f7fb";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password2: "",
    gender: "",
    date_of_birth: "",
    blood_group: "",
    address: "",
    guardian_name: "",
    guardian_phone: "",
    photo: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      await register(form);
      setSuccess("Registration successful! Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: LIGHT_BLUE, minHeight: "100vh", py: 6 }}>
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
          {/* Left Section - Illustration / Brand */}
          <Box
            sx={{
              flex: 1,
              bgcolor: BLUE,
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              textAlign: "center",
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
              <PersonAddAltIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Student Registration
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Join our learning platform and start your academic journey.
            </Typography>
          </Box>

          {/* Right Section - Form */}
          <Box sx={{ flex: 2, p: { xs: 3, sm: 4, md: 5 } }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Typography
              variant="h5"
              fontWeight="600"
              color={BLUE}
              gutterBottom
              align="center"
            >
              Create Your Account
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box
              component="form"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <Grid container spacing={2}>
                {/* Username / Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Name Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
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
                  />
                </Grid>

                {/* Phone */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Gender / DOB */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ minWidth: 220 }}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      label="Gender"
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Blood / Address */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ minWidth: 225 }}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      label="Blood Group"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                        (bg) => (
                          <MenuItem key={bg} value={bg}>
                            {bg}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} >
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Guardian Info */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guardian Name"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guardian Phone"
                    name="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Photo */}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ py: 1.2, borderColor: BLUE }}
                  >
                    Upload Photo
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      hidden
                      onChange={handleChange}
                    />
                  </Button>
                  {formData.photo && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "text.secondary" }}
                    >
                      Selected: {formData.photo.name}
                    </Typography>
                  )}
                </Grid>

                {/* Password Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
                  />
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: BLUE,
                  "&:hover": { bgcolor: "#004ba0" },
                }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>

              <Typography align="center" sx={{ mt: 2 }}>
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
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;


// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import {
//   Container,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Alert,
//   Grid,
//   Avatar,
// } from "@mui/material";
// import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

// const BLUE = "#1565c0";
// const LIGHT_BLUE = "#e3f2fd";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     first_name: "",
//     last_name: "",
//     phone: "",
//     password: "",
//     password2: "",
//   });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (formData.password !== formData.password2) {
//       setError("Passwords do not match");
//       return;
//     }

//     setLoading(true);

//     try {
//       await register(formData);
//       setSuccess("Registration successful! Please wait for admin approval.");
//       setTimeout(() => navigate("/login"), 3000);
//     } catch (err) {
//       setError(err.error || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         bgcolor: LIGHT_BLUE,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         p: 2,
//       }}
//     >
//       <Container maxWidth="md">
//         <Paper
//           elevation={3}
//           sx={{
//             p: 4,
//             borderRadius: 3,
//             bgcolor: "#fff",
//             border: `1.5px solid ${BLUE}`,
//             boxShadow: "0 8px 32px rgba(21,101,192,0.08)",
//             color: "#222",
//           }}
//         >
//           <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
//             <Avatar sx={{ m: 1, bgcolor: BLUE, width: 56, height: 56 }}>
//               <PersonAddAltIcon fontSize="large" />
//             </Avatar>
//             <Typography
//               variant="h4"
//               align="center"
//               fontWeight="bold"
//               sx={{
//                 mb: 0.5,
//                 color: BLUE,
//               }}
//             >
//               Student Registration
//             </Typography>
//           </Box>

//           <Typography
//             variant="subtitle1"
//             align="center"
//             color="#223a5e"
//             mb={3}
//           >
//             Create your student account
//           </Typography>

//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//           )}

//           {success && (
//             <Alert severity="success" sx={{ mb: 2 }}>
//               {success}
//             </Alert>
//           )}

//           <Box component="form" onSubmit={handleSubmit}>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Username"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   required
//                   sx={{
//                     "& .MuiOutlinedInput-root": { borderRadius: 2 }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   sx={{
//                     "& .MuiOutlinedInput-root": { borderRadius: 2 }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="First Name"
//                   name="first_name"
//                   value={formData.first_name}
//                   onChange={handleChange}
//                   required
//                   sx={{
//                     "& .MuiOutlinedInput-root": { borderRadius: 2 }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Last Name"
//                   name="last_name"
//                   value={formData.last_name}
//                   onChange={handleChange}
//                   required
//                   sx={{
//                     "& .MuiOutlinedInput-root": { borderRadius: 2 }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Phone"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   sx={{
//                     "& .MuiOutlinedInput-root": { borderRadius: 2 }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Password"
//                   name="password"
//                   type="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                   sx={{
//                     "& .MuiOutlinedInput-root": { borderRadius: 2 }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Confirm Password"
//                   name="password2"
//                   type="password"
//                   value={formData.password2}
//                   onChange={handleChange}
//                   required
//                   sx={{
//                     "& .MuiOutlinedInput-root": { borderRadius: 2 }
//                   }}
//                 />
//               </Grid>
//             </Grid>

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               size="large"
//               sx={{
//                 mt: 3,
//                 mb: 2,
//                 py: 1.3,
//                 fontWeight: "bold",
//                 fontSize: "1rem",
//                 borderRadius: 2,
//                 bgcolor: BLUE,
//                 color: "#fff",
//                 boxShadow: "none",
//                 "&:hover": {
//                   bgcolor: "#003c8f",
//                   transform: "translateY(-2px)",
//                 },
//               }}
//               disabled={loading}
//             >
//               {loading ? "Registering..." : "Register"}
//             </Button>

//             <Typography align="center" sx={{ color: "#333" }}>
//               Already have an account?{" "}
//               <Link
//                 to="/login"
//                 style={{
//                   color: BLUE,
//                   fontWeight: 600,
//                   textDecoration: "none",
//                 }}
//               >
//                 Login
//               </Link>
//             </Typography>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default Register;
