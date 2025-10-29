import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Box, Select, MenuItem, FormControl, InputLabel, Chip, Alert,
  OutlinedInput, Avatar, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, List, ListItemButton, ListItemIcon,
  ListItemText, Badge, Divider, Tooltip
} from '@mui/material';
import {
  Add, Edit, Delete, PersonAdd, Email, Phone, RemoveCircle, Person, School, CalendarToday,
  Group, Dashboard as DashboardIcon, People, Assignment, Task, Menu as MenuIcon, Close
} from '@mui/icons-material';

const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';

const ManageBatches = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [openViewStudentsDialog, setOpenViewStudentsDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('batches');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    course_id: '',
    mentor_id: '',
    start_date: '',
    end_date: '',
    max_students: 30,
    is_active: true,
  });
  const [selectedStudents, setSelectedStudents] = useState([]);

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
    fetchBatches();
    fetchCourses();
    fetchMentors();
    fetchStudents();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await API.get('/courses/batches/');
      setBatches(response.data);
    } catch (error) { }
  };
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
  const fetchStudents = async () => {
    try {
      const response = await API.get('/auth/students/');
      setStudents(response.data);
    } catch (error) { }
  };
  const fetchBatchStudents = async (batchId) => {
    try {
      const response = await API.get(`/courses/batches/${batchId}/students/`);
      setBatchStudents(response.data.students || []);
    } catch (error) {
      setBatchStudents([]);
    }
  };
  const handleOpenDialog = (batch = null) => {
    if (batch) {
      setFormData({
        name: batch.name,
        course_id: batch.course.id,
        mentor_id: batch.mentor?.id || '',
        start_date: batch.start_date,
        end_date: batch.end_date,
        max_students: batch.max_students,
        is_active: batch.is_active,
      });
      setSelectedBatch(batch);
    } else {
      setFormData({
        name: '',
        course_id: '',
        mentor_id: '',
        start_date: '',
        end_date: '',
        max_students: 30,
        is_active: true,
      });
      setSelectedBatch(null);
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
  };
  const handleSubmit = async () => {
    try {
      if (selectedBatch) {
        await API.put(`/courses/batches/${selectedBatch.id}/update/`, formData);
        setMessage({ type: 'success', text: 'Batch updated successfully!' });
      } else {
        await API.post('/courses/batches/create/', formData);
        setMessage({ type: 'success', text: 'Batch created successfully!' });
      }
      fetchBatches();
      handleCloseDialog();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving batch' });
    }
  };
  const handleDelete = async (batchId, batchName) => {
    if (window.confirm(`Are you sure you want to delete "${batchName}"?`)) {
      try {
        await API.delete(`/courses/batches/${batchId}/delete/`);
        setMessage({ type: 'success', text: 'Batch deleted successfully!' });
        fetchBatches();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting batch' });
      }
    }
  };
  const handleOpenStudentDialog = (batch) => {
    setSelectedBatch(batch);
    setSelectedStudents(batch.students?.map(s => s.id) || []);
    setOpenStudentDialog(true);
  };
  const handleOpenViewStudentsDialog = async (batch) => {
    setSelectedBatch(batch);
    setOpenViewStudentsDialog(true);
    await fetchBatchStudents(batch.id);
  };
  const handleCloseViewStudentsDialog = () => {
    setOpenViewStudentsDialog(false);
    setSelectedBatch(null);
    setBatchStudents([]);
  };
  const handleAddStudents = async () => {
    try {
      await API.post(`/courses/batches/${selectedBatch.id}/add-students/`, {
        student_ids: selectedStudents,
      });
      setMessage({ type: 'success', text: 'Students added successfully!' });
      fetchBatches();
      setOpenStudentDialog(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding students' });
    }
  };
  const handleRemoveStudent = async (batchId, studentId) => {
    if (window.confirm('Are you sure you want to remove this student from the batch?')) {
      try {
        await API.post(`/courses/batches/${batchId}/remove-student/`, { student_id: studentId });
        setMessage({ type: 'success', text: 'Student removed successfully!' });
        await fetchBatchStudents(batchId);
        fetchBatches();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error removing student' });
      }
    }
  };
  const getInitials = (firstName, lastName) => (
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  );

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
              onClick={() => { setActiveNav(item.id); navigate(item.path); }}
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
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 400, color: isActive ? '#fff' : BLUE }}
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
          <Paper elevation={0} sx={{
            p: 3, mb: 4, borderRadius: 3, bgcolor: '#fff',
            border: `1.5px solid ${BLUE}`,
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 1 }}>
                  Manage Batches
                </Typography>
                <Typography variant="body2" sx={{ color: '#223a5e' }}>
                  Create and manage course batches, assign mentors and students
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: BLUE, color: '#fff', px: 3, py: 1.2, borderRadius: 2,
                  fontWeight: 700, boxShadow: 'none',
                  '&:hover': { bgcolor: '#003c8f' },
                }}
              >
                Add New Batch
              </Button>
            </Box>
          </Paper>
          {message.text && (
            <Alert severity={message.type} sx={{
              mb: 3, borderRadius: 2,
              boxShadow: '0 2px 8px rgba(21,101,192,0.08)',
              color: message.type === 'error' ? "#d32f2f" : BLUE,
            }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}
          <Paper elevation={0} sx={{
            borderRadius: 3,
            border: `1.5px solid ${LIGHT_BLUE}`,
            bgcolor: '#fff',
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Batch Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Mentor</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Students</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <School sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                        <Typography variant="h6" color={BLUE} gutterBottom>
                          No Batches Yet
                        </Typography>
                        <Typography variant="body2" color="#223a5e" sx={{ mb: 3 }}>
                          Create your first batch to get started
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
                          Create Batch
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.map((batch) => (
                      <TableRow
                        key={batch.id}
                        hover
                        onClick={() => handleOpenViewStudentsDialog(batch)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: LIGHT_BLUE },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {batch.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <School sx={{ fontSize: 16, color: BLUE }} />
                            <Typography variant="body2">
                              {batch.course.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {batch.mentor ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                sx={{ width: 32, height: 32, bgcolor: BLUE, fontWeight: 600 }}
                              >
                                {getInitials(batch.mentor.first_name, batch.mentor.last_name)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {batch.mentor.first_name} {batch.mentor.last_name}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="#223a5e">
                              No Mentor
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<Group sx={{ fontSize: 16 }} />}
                            label={`${batch.student_count || 0}/${batch.max_students}`}
                            size="small"
                            sx={{
                              background: LIGHT_BLUE,
                              color: BLUE,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                              <Typography variant="caption" color={BLUE}>
                                {new Date(batch.start_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                              <Typography variant="caption" color={BLUE}>
                                {new Date(batch.end_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={batch.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              background: batch.is_active
                                ? BLUE
                                : '#e0e0e0',
                              color: batch.is_active ? '#fff' : BLUE,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="Add Students">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenStudentDialog(batch);
                                }}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': { bgcolor: BLUE, color: "#fff" },
                                }}
                              >
                                <PersonAdd fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Batch">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDialog(batch);
                                }}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': { bgcolor: BLUE, color: "#fff" },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Batch">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(batch.id, batch.name);
                                }}
                                sx={{
                                  border: `1px solid #d32f2f`,
                                  color: '#d32f2f',
                                  borderRadius: 1.5,
                                  '&:hover': { bgcolor: '#d32f2f', color: '#fff' },
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

          {/* Create/Edit Batch Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
              {selectedBatch ? 'Edit Batch' : 'Create New Batch'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Batch Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={formData.course_id}
                      onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                      label="Course"
                      sx={{ borderRadius: 2 }}
                    >
                      {courses.map(course => (
                        <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Mentor</InputLabel>
                    <Select
                      value={formData.mentor_id}
                      onChange={e => setFormData({ ...formData, mentor_id: e.target.value })}
                      label="Mentor"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {mentors.map(mentor => (
                        <MenuItem key={mentor.id} value={mentor.id}>
                          {mentor.first_name} {mentor.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Maximum Students"
                    type="number"
                    value={formData.max_students}
                    onChange={e => setFormData({ ...formData, max_students: e.target.value })}
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
                {selectedBatch ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Students Dialog */}
          <Dialog
            open={openStudentDialog}
            onClose={() => setOpenStudentDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
              Add Students to {selectedBatch?.name}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Students</InputLabel>
                <Select
                  multiple
                  value={selectedStudents}
                  onChange={e => setSelectedStudents(e.target.value)}
                  input={<OutlinedInput label="Select Students" />}
                  sx={{ borderRadius: 2 }}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => {
                        const student = students.find(s => s.id === value);
                        return (
                          <Chip
                            key={value}
                            label={`${student?.first_name} ${student?.last_name}`}
                            size="small"
                            sx={{ background: LIGHT_BLUE, color: BLUE }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {students.map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenStudentDialog(false)} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button
                onClick={handleAddStudents}
                variant="contained"
                sx={{
                  bgcolor: BLUE,
                  borderRadius: 2,
                  px: 3,
                  color: '#fff',
                  '&:hover': { bgcolor: '#003c8f' },
                }}
              >
                Add Students
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Students Dialog */}
          <Dialog
            open={openViewStudentsDialog}
            onClose={handleCloseViewStudentsDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
              <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
              Students in {selectedBatch?.name}
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {batchStudents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Group sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                  <Typography variant="body1" color={BLUE}>
                    No students enrolled in this batch yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Phone</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {batchStudents.map(student => (
                        <TableRow key={student.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar
                                sx={{
                                  bgcolor: BLUE,
                                  width: 36,
                                  height: 36,
                                  fontWeight: 600,
                                  color: "#fff"
                                }}
                              >
                                {getInitials(student.first_name, student.last_name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {student.first_name} {student.last_name}
                                </Typography>
                                <Chip
                                  label={student.is_approved ? 'Approved' : 'Pending'}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.7rem',
                                    background: student.is_approved
                                      ? BLUE
                                      : LIGHT_BLUE,
                                    color: student.is_approved ? "#fff" : BLUE,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{student.username}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Email sx={{ fontSize: 16, color: BLUE }} />
                              {student.email}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Phone sx={{ fontSize: 16, color: BLUE }} />
                              {student.phone || 'N/A'}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveStudent(selectedBatch.id, student.id)}
                              title="Remove from batch"
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  bgcolor: 'error.main',
                                  color: 'white',
                                },
                              }}
                            >
                              <RemoveCircle />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseViewStudentsDialog} sx={{ borderRadius: 2 }}>
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => {
                  handleCloseViewStudentsDialog();
                  handleOpenStudentDialog(selectedBatch);
                }}
                sx={{
                  bgcolor: BLUE,
                  borderRadius: 2,
                  px: 3,
                  color: '#fff',
                  '&:hover': { bgcolor: '#003c8f' }
                }}
              >
                Add More Students
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default ManageBatches;
