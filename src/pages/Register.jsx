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
//   MenuItem,
//   InputLabel,
//   Select,
//   FormControl,
//   Divider,
// } from "@mui/material";
// import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

// const BLUE = "#1976d2";
// const LIGHT_BLUE = "#f4f7fb";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     first_name: "",
//     last_name: "",
//     phone: "",
//     password: "",
//     password2: "",
//     gender: "",
//     date_of_birth: "",
//     blood_group: "",
//     address: "",
//     guardian_name: "",
//     guardian_phone: "",
//     photo: null,
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "photo") {
//       setFormData({ ...formData, photo: files[0] });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
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
//       const form = new FormData();
//       Object.entries(formData).forEach(([key, value]) => {
//         if (value) form.append(key, value);
//       });

//       await register(form);
//       setSuccess("Registration successful! Please wait for admin approval.");
//       setTimeout(() => navigate("/login"), 3000);
//     } catch (err) {
//       setError(err.error || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ bgcolor: LIGHT_BLUE, minHeight: "100vh", py: 6 }}>
//       <Container maxWidth="lg">
//         <Paper
//           elevation={4}
//           sx={{
//             borderRadius: 4,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: { xs: "column", md: "row" },
//           }}
//         >
//           {/* Left Section - Illustration / Brand */}
//           <Box
//             sx={{
//               flex: 1,
//               bgcolor: BLUE,
//               color: "white",
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//               alignItems: "center",
//               p: 4,
//               textAlign: "center",
//             }}
//           >
//             <Avatar
//               sx={{
//                 bgcolor: "white",
//                 color: BLUE,
//                 width: 70,
//                 height: 70,
//                 mb: 2,
//               }}
//             >
//               <PersonAddAltIcon fontSize="large" />
//             </Avatar>
//             <Typography variant="h4" fontWeight="bold" mb={1}>
//               Student Registration
//             </Typography>
//             <Typography variant="body1" sx={{ opacity: 0.9 }}>
//               Join our learning platform and start your academic journey.
//             </Typography>
//           </Box>

//           {/* Right Section - Form */}
//           <Box sx={{ flex: 2, p: { xs: 3, sm: 4, md: 5 } }}>
//             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//             {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

//             <Typography
//               variant="h5"
//               fontWeight="600"
//               color={BLUE}
//               gutterBottom
//               align="center"
//             >
//               Create Your Account
//             </Typography>

//             <Divider sx={{ mb: 3 }} />

//             <Box
//               component="form"
//               onSubmit={handleSubmit}
//               encType="multipart/form-data"
//             >
//               <Grid container spacing={2}>
//                 {/* Row 1: Username, Email, Phone */}
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Username"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Phone"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>

//                 {/* Row 2: First Name, Last Name, Date of Birth */}
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="First Name"
//                     name="first_name"
//                     value={formData.first_name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Last Name"
//                     name="last_name"
//                     value={formData.last_name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Date of Birth"
//                     name="date_of_birth"
//                     type="date"
//                     InputLabelProps={{ shrink: true }}
//                     value={formData.date_of_birth}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>

//                 {/* Row 3: Gender, Blood Group, Address */}
//                 <Grid item xs={12} sm={4}>
//                   <FormControl fullWidth>
//                     <InputLabel>Gender</InputLabel>
//                     <Select
//                       name="gender"
//                       value={formData.gender}
//                       onChange={handleChange}
//                       label="Gender"
//                     >
//                       <MenuItem value="Male">Male</MenuItem>
//                       <MenuItem value="Female">Female</MenuItem>
//                       <MenuItem value="Other">Other</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <FormControl fullWidth>
//                     <InputLabel>Blood Group</InputLabel>
//                     <Select
//                       name="blood_group"
//                       value={formData.blood_group}
//                       onChange={handleChange}
//                       label="Blood Group"
//                     >
//                       {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
//                         (bg) => (
//                           <MenuItem key={bg} value={bg}>
//                             {bg}
//                           </MenuItem>
//                         )
//                       )}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Address"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                   />
//                 </Grid>

//                 {/* Row 4: Guardian Name, Guardian Phone, Photo Upload */}
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Guardian Name"
//                     name="guardian_name"
//                     value={formData.guardian_name}
//                     onChange={handleChange}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Guardian Phone"
//                     name="guardian_phone"
//                     value={formData.guardian_phone}
//                     onChange={handleChange}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <Button
//                     variant="outlined"
//                     component="label"
//                     fullWidth
//                     sx={{ 
//                       height: '56px',
//                       borderColor: BLUE,
//                       justifyContent: 'flex-start',
//                       textTransform: 'none',
//                       px: 2,
//                       color: formData.photo ? 'text.primary' : 'text.secondary'
//                     }}
//                   >
//                     {formData.photo ? formData.photo.name : "Upload Photo"}
//                     <input
//                       type="file"
//                       name="photo"
//                       accept="image/*"
//                       hidden
//                       onChange={handleChange}
//                     />
//                   </Button>
//                 </Grid>

//                 {/* Row 5: Password, Confirm Password, (empty third column) */}
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Password"
//                     name="password"
//                     type="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label="Confirm Password"
//                     name="password2"
//                     type="password"
//                     value={formData.password2}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   {/* Empty space for alignment - matches your image */}
//                 </Grid>
//               </Grid>

//               {/* Submit Button */}
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 size="large"
//                 sx={{
//                   mt: 4,
//                   py: 1.5,
//                   fontWeight: 600,
//                   borderRadius: 2,
//                   bgcolor: BLUE,
//                   "&:hover": { bgcolor: "#004ba0" },
//                 }}
//                 disabled={loading}
//               >
//                 {loading ? "Registering..." : "Register"}
//               </Button>

//               <Typography align="center" sx={{ mt: 2 }}>
//                 Already have an account?{" "}
//                 <Link
//                   to="/login"
//                   style={{
//                     color: BLUE,
//                     fontWeight: 600,
//                     textDecoration: "none",
//                   }}
//                 >
//                   Login
//                 </Link>
//               </Typography>
//             </Box>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default Register;
  

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
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Divider,
} from "@mui/material";

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
    <Box sx={{ bgcolor: LIGHT_BLUE, minHeight: "100vh", py: 8 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            p: { xs: 3, sm: 5 },
            backgroundColor: "white",
          }}
        >
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Typography
            variant="h5"
            fontWeight="600"
            color={BLUE}
            gutterBottom
            align="center"
          >
            Student Registration
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <FormControl fullWidth>
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

            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                label="Blood Group"
              >
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <MenuItem key={bg} value={bg}>
                    {bg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Guardian Name"
              name="guardian_name"
              value={formData.guardian_name}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Guardian Phone"
              name="guardian_phone"
              value={formData.guardian_phone}
              onChange={handleChange}
            />

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
                sx={{ mt: -1, color: "text.secondary" }}
              >
                Selected: {formData.photo.name}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 2,
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
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;