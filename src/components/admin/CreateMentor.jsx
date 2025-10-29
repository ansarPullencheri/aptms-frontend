import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  Avatar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  School,
  Person,
  Email,
  Phone,
  Lock,
  Dashboard as DashboardIcon,
  People,
  Assignment,
  Task,
  PersonAdd,
  Menu as MenuIcon,
  Close,
  Save,
  AccountCircle,
} from '@mui/icons-material';

// Blue theme constants
const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';

const CreateMentor = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('mentors');
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    { id: 'approvals', label: 'Approvals', icon: PersonAdd, path: '/admin/student-approval' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await API.post('/auth/create-mentor/', formData);
      setMessage({ type: 'success', text: 'Mentor created successfully!' });
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error creating mentor',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Simplified Sidebar - matching AdminDashboard
  const Sidebar = () => (
    <Box
      sx={{
        width: sidebarOpen ? 220 : 70,
        height: 'calc(100vh - 64px)',
        bgcolor: '#fff',
        color: '#333',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 64,
        zIndex: 1000,
        borderRight: `2px solid ${LIGHT_BLUE}`,
        boxShadow: '2px 0 16px rgba(21,101,192,0.12)',
        transition: 'width 0.18s',
        p: 0,
      }}
    >
      {/* Toggle Button */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-end' : 'center',
        }}
      >
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: BLUE }}>
          {sidebarOpen ? <Close /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: LIGHT_BLUE, mx: 2 }} />

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <ListItemButton
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                navigate(item.path);
              }}
              sx={{
                borderRadius: 1.5,
                color: isActive ? '#fff' : BLUE,
                background: isActive ? BLUE : 'transparent',
                mb: 0.5,
                '&:hover': { background: LIGHT_BLUE },
                px: 2,
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#fff' : BLUE, minWidth: 40 }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#fff' : BLUE,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: '#fff',
              border: `1.5px solid ${BLUE}`,
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: BLUE,
                  color: '#fff',
                }}
              >
                <School sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  Create New Mentor
                </Typography>
                <Typography variant="body2" sx={{ color: '#223a5e' }}>
                  Add a new mentor to the system with their credentials and information
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Alert Message */}
          {message.text && (
            <Alert
              severity={message.type}
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(21,101,192,0.08)',
                color: message.type === 'error' ? '#d32f2f' : BLUE,
              }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Form */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: `1.5px solid ${LIGHT_BLUE}`,
              bgcolor: '#fff',
              boxShadow: '0 2px 8px rgba(21,101,192,0.07)',
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Account Information Section */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <AccountCircle sx={{ color: BLUE }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE }}>
                      Mentor Information
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3, bgcolor: LIGHT_BLUE }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: BLUE }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: BLUE }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: BLUE }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: BLUE }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: BLUE }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: BLUE }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/admin/manage-users')}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        color: BLUE,
                        borderColor: BLUE,
                        '&:hover': { bgcolor: LIGHT_BLUE },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={<Save />}
                      sx={{
                        background: BLUE,
                        borderRadius: 2,
                        px: 4,
                        color: '#fff',
                        '&:hover': { bgcolor: '#003c8f' },
                        transition: 'all 0.3s',
                      }}
                    >
                      {loading ? 'Creating...' : 'Create Mentor'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default CreateMentor;
