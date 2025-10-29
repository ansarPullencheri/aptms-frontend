import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Box, Select, MenuItem, FormControl, InputLabel, Alert,
  IconButton, Avatar, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Badge, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Tooltip
} from '@mui/material';
import {
  Add, Edit, Delete, PersonAdd, School, Timer, Dashboard as DashboardIcon,
  People, Assignment, Task, Menu as MenuIcon, Close
} from '@mui/icons-material';

const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('courses');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration_weeks: 1,
  });
  const [selectedMentor, setSelectedMentor] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    { id: 'approvals', label: 'Approvals', icon: PersonAdd, path: '/admin/student-approval' },
  ];

  useEffect(() => {
    fetchCourses();
    fetchMentors();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/');
      setCourses(response.data);
    } catch (error) { }
  };

  const fetchMentors = async () => {
    try {
      const response = await API.get('/auth/mentors/');
      setMentors(response.data);
    } catch (error) { }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setFormData({
        name: course.name,
        code: course.code || '',
        description: course.description,
        duration_weeks: course.duration_weeks,
      });
      setSelectedCourse(course);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        duration_weeks: 1,
      });
      setSelectedCourse(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        duration_weeks: parseInt(formData.duration_weeks) || 1,
      };
      if (selectedCourse) {
        await API.put(`/courses/${selectedCourse.id}/update/`, submitData);
        setMessage({ type: 'success', text: 'Course updated successfully!' });
      } else {
        await API.post('/courses/create/', submitData);
        setMessage({ type: 'success', text: 'Course created successfully!' });
      }
      fetchCourses();
      handleCloseDialog();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        'Error saving course';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleDelete = async (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      try {
        await API.delete(`/courses/${courseId}/delete/`);
        setMessage({ type: 'success', text: 'Course deleted successfully!' });
        fetchCourses();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting course' });
      }
    }
  };

  const handleOpenAssignDialog = (course) => {
    setSelectedCourse(course);
    setSelectedMentor(course.mentor?.id || '');
    setOpenAssignDialog(true);
  };

  const handleAssignMentor = async () => {
    try {
      await API.post(`/courses/${selectedCourse.id}/assign-mentor/`, {
        mentor_id: selectedMentor,
      });
      setMessage({ type: 'success', text: 'Mentor assigned successfully!' });
      fetchCourses();
      setOpenAssignDialog(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error assigning mentor' });
    }
  };

  const getInitials = (firstName, lastName) => (
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  );

  // ✅ Simplified Sidebar - matching AdminDashboard
  const Sidebar = () => (
    <Box sx={{
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
      p: 0
    }}>
      {/* Toggle Button */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'flex-end' : 'center',
      }}>
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
                    color: isActive ? '#fff' : BLUE
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Paper elevation={0} sx={{
            p: 3, mb: 4, borderRadius: 3, bgcolor: '#fff',
            border: `1.5px solid ${BLUE}`
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 1 }}>
                  Manage Courses
                </Typography>
                <Typography variant="body2" sx={{ color: '#223a5e' }}>
                  Create, edit, and manage courses with mentor assignments
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: BLUE, color: '#fff', px: 3, py: 1.2, borderRadius: 2,
                  fontWeight: 600, boxShadow: 'none',
                  '&:hover': { bgcolor: '#003c8f' },
                  transition: 'all 0.3s',
                }}
              >
                Add New Course
              </Button>
            </Box>
          </Paper>

          {message.text && (
            <Alert
              severity={message.type}
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(21,101,192,0.08)',
                color: message.type === 'error' ? "#d32f2f" : BLUE,
              }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Courses Table */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1.5px solid ${LIGHT_BLUE}`,
              bgcolor: '#fff',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Course Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Duration
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Mentor
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Assignment sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                        <Typography variant="h6" color={BLUE}>
                          No Courses Yet
                        </Typography>
                        <Typography variant="body2" color="#223a5e" sx={{ mb: 3 }}>
                          Create your first course to get started
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => handleOpenDialog()}
                          sx={{
                            bgcolor: BLUE,
                            color: "#fff",
                            borderRadius: 2,
                            px: 3,
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#003c8f' }
                          }}
                        >
                          Create Course
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course) => (
                      <TableRow
                        key={course.id}
                        sx={{
                          '&:hover': { bgcolor: LIGHT_BLUE },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {course.name}
                          </Typography>
                          {course.code && (
                            <Typography variant="caption" color="#223a5e">
                              {course.code}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="#223a5e"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 400,
                            }}
                          >
                            {course.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Timer sx={{ fontSize: 16, color: BLUE }} />
                            <Typography variant="body2">
                              {course.duration_weeks} weeks
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {course.mentor ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: BLUE,
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(course.mentor.first_name, course.mentor.last_name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {course.mentor.first_name} {course.mentor.last_name}
                                </Typography>
                                <Typography variant="caption" color="#223a5e">
                                  {course.mentor.email}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Chip
                              label="No Mentor"
                              size="small"
                              sx={{
                                background: LIGHT_BLUE,
                                color: BLUE,
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="Assign Mentor">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenAssignDialog(course)}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': {
                                    bgcolor: BLUE,
                                    color: '#fff',
                                  },
                                }}
                              >
                                <PersonAdd fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Course">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(course)}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': {
                                    bgcolor: BLUE,
                                    color: '#fff',
                                  },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Course">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(course.id, course.name)}
                                sx={{
                                  border: `1px solid #d32f2f`,
                                  color: '#d32f2f',
                                  borderRadius: 1.5,
                                  '&:hover': {
                                    bgcolor: '#d32f2f',
                                    color: '#fff',
                                  },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>

      {/* Create/Edit Course Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          bgcolor: BLUE,
          color: '#fff',
          fontWeight: 700,
        }}>
          {selectedCourse ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., CS101"
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the course..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration (weeks)"
                type="number"
                value={formData.duration_weeks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_weeks: parseInt(e.target.value) || 1
                  })}
                inputProps={{ min: 1 }}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: BLUE,
              borderRadius: 2,
              px: 3,
              color: '#fff',
              '&:hover': { bgcolor: '#003c8f' },
            }}
          >
            {selectedCourse ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Mentor Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          bgcolor: BLUE,
          color: '#fff',
          fontWeight: 700,
        }}>
          Assign Mentor to Course
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Select Mentor</InputLabel>
            <Select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              label="Select Mentor"
              sx={{ borderRadius: 2, bgcolor: '#fff' }}
            >
              {mentors.map((mentor) => (
                <MenuItem key={mentor.id} value={mentor.id}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: BLUE,
                        fontSize: '0.875rem',
                        color: '#fff'
                      }}
                    >
                      {getInitials(mentor.first_name, mentor.last_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {mentor.first_name} {mentor.last_name}
                      </Typography>
                      <Typography variant="caption" color="#223a5e">
                        {mentor.email}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAssignDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignMentor}
            variant="contained"
            sx={{
              bgcolor: BLUE,
              borderRadius: 2,
              px: 3,
              color: '#fff',
              '&:hover': { bgcolor: '#003c8f' },
            }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCourses;
