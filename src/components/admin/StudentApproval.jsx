import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Checkbox,
  ListItemText,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  School,
  People,
  Assignment,
  Task,
  PersonAdd,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Close,
  Email,
  Phone,
  CalendarToday,
  Add,
} from '@mui/icons-material';

const BLUE = '#1976d2';
const LIGHT_GREY = '#f5f7fa';

const StudentApproval = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('approvals');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const [assignmentData, setAssignmentData] = useState({ course_id: '', batch_ids: [] });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage Users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: PersonAdd,
      path: '/admin/student-approval',
      badge: students.filter((s) => !s.is_approved).length,
    },
  ];

  useEffect(() => {
    fetchPendingStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (assignmentData.course_id) fetchBatchesByCourse(assignmentData.course_id);
    else setBatches([]);
  }, [assignmentData.course_id]);

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/pending-students/');
      setStudents(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch pending students' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/');
      setCourses(response.data);
    } catch (error) {}
  };

  const fetchBatchesByCourse = async (courseId) => {
    try {
      const response = await API.get('/courses/batches/');
      const courseBatches = response.data.filter(
        (b) => b.course.id === parseInt(courseId) && b.is_active
      );
      setBatches(courseBatches);
    } catch (error) {
      setBatches([]);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenApprovalDialog = (student) => {
    setSelectedStudent(student);
    setAssignmentData({ course_id: '', batch_ids: [] });
    setBatches([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setAssignmentData({ course_id: '', batch_ids: [] });
    setBatches([]);
  };

  const handleApprove = async () => {
    if (!assignmentData.course_id || assignmentData.batch_ids.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one course and batch' });
      return;
    }
    try {
      const response = await API.post(`/auth/approve-student/${selectedStudent.id}/`, {
        batch_ids: assignmentData.batch_ids,
      });
      setMessage({
        type: 'success',
        text: response.data.message || `${selectedStudent.first_name} ${selectedStudent.last_name} approved successfully!`,
      });
      await fetchPendingStudents();
      handleCloseDialog();
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error approving student' });
    }
  };

  const handleReject = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to reject ${username}?`)) return;
    try {
      await API.delete(`/auth/users/${userId}/`);
      setMessage({ type: 'success', text: `${username} rejected successfully` });
      fetchPendingStudents();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error rejecting student' });
    }
  };

  const getInitials = (firstName, lastName) =>
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  // ✅ EXACT SIDEBAR FROM MANAGETASKS
  const Sidebar = () => (
    <Box
      sx={{
        width: sidebarOpen ? 220 : 70,
        height: '100vh',
        bgcolor: '#fff',
        borderRight: '1px solid #e0e0e0',
        transition: 'width 0.25s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 6px rgba(0,0,0,0.04)',
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          p: 2,
        }}
      >
        {sidebarOpen && (
          <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700 }}>
            Admin
          </Typography>
        )}
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: BLUE }}>
          {sidebarOpen ? <Close /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ flex: 1 }}>
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
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                backgroundColor: isActive ? BLUE : 'transparent',
                '&:hover': { backgroundColor: isActive ? BLUE : LIGHT_GREY },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#fff' : BLUE }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <Icon fontSize="small" />
                  </Badge>
                ) : (
                  <Icon fontSize="small" />
                )}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : '#333',
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
        <Sidebar />
        <Box
          sx={{
            flex: 1,
            ml: sidebarOpen ? '220px' : '70px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: BLUE }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin 0.25s ease' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: '#fff',
              border: '1px solid #e0e0e0',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                  Student Approvals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review and approve pending student registrations
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: LIGHT_GREY }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  {students.filter((s) => !s.is_approved).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Approvals
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Message Alert */}
          {message.text && (
            <Alert
              severity={message.type}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Content */}
          {students.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
              }}
            >
              <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
              <Typography variant="h6" color="#222">
                All Clear!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No pending student approvals at the moment
              </Typography>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                bgcolor: '#fff',
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                      <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                        Student
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                        Contact Information
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                        Registered Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: LIGHT_GREY },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: BLUE,
                                color: '#fff',
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(student.first_name, student.last_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {student.first_name} {student.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                @{student.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Email sx={{ fontSize: 16, color: BLUE }} />
                              <Typography variant="body2">{student.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone sx={{ fontSize: 16, color: BLUE }} />
                              <Typography variant="body2" color="text.secondary">
                                {student.phone || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 16, color: BLUE }} />
                            <Typography variant="body2">
                              {new Date(student.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Pending"
                            size="small"
                            sx={{
                              bgcolor: LIGHT_GREY,
                              color: BLUE,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Approve Student">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CheckCircle />}
                                onClick={() => handleOpenApprovalDialog(student)}
                                sx={{
                                  bgcolor: BLUE,
                                  borderRadius: 2,
                                  fontWeight: 600,
                                  color: '#fff',
                                  '&:hover': { bgcolor: '#1565c0' },
                                }}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject Student">
                              <IconButton
                                size="small"
                                onClick={() => handleReject(student.id, student.username)}
                                sx={{
                                  border: '1px solid #d32f2f',
                                  color: '#d32f2f',
                                  borderRadius: 1.5,
                                  '&:hover': { bgcolor: '#d32f2f', color: '#fff' },
                                }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {students.length > 0 && (
                <TablePagination
                  component="div"
                  count={students.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{
                    borderTop: '1px solid #e0e0e0',
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      color: '#555',
                      fontWeight: 500,
                    },
                  }}
                />
              )}
            </Paper>
          )}
        </Container>
      </Box>

      {/* Approval Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle />
            Approve Student
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedStudent && (
            <Box>
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: LIGHT_GREY, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: BLUE,
                      color: '#fff',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudent.email}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Assign student to course and batch(es) to complete the approval
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Course</InputLabel>
                    <Select
                      value={assignmentData.course_id}
                      onChange={(e) => {
                        setAssignmentData({
                          course_id: e.target.value,
                          batch_ids: [],
                        });
                      }}
                      label="Select Course"
                      sx={{ borderRadius: 2 }}
                    >
                      {courses.length === 0 ? (
                        <MenuItem disabled>No courses available</MenuItem>
                      ) : (
                        courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required disabled={!assignmentData.course_id}>
                    <InputLabel>Select Batch(es)</InputLabel>
                    <Select
                      multiple
                      value={assignmentData.batch_ids}
                      onChange={(e) =>
                        setAssignmentData({ ...assignmentData, batch_ids: e.target.value })
                      }
                      label="Select Batch(es)"
                      sx={{ borderRadius: 2 }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Select batches...
                            </Typography>
                          ) : (
                            selected.map((value) => {
                              const batch = batches.find((b) => b.id === value);
                              return (
                                <Chip
                                  key={value}
                                  label={batch?.name}
                                  size="small"
                                  sx={{
                                    bgcolor: LIGHT_GREY,
                                    color: BLUE,
                                    fontWeight: 600,
                                  }}
                                />
                              );
                            })
                          )}
                        </Box>
                      )}
                    >
                      {batches.length === 0 ? (
                        <MenuItem disabled>
                          {assignmentData.course_id
                            ? 'No active batches available for this course'
                            : 'Please select a course first'}
                        </MenuItem>
                      ) : (
                        batches.map((batch) => (
                          <MenuItem key={batch.id} value={batch.id}>
                            <Checkbox
                              checked={assignmentData.batch_ids.indexOf(batch.id) > -1}
                              sx={{ color: BLUE }}
                            />
                            <ListItemText
                              primary={batch.name}
                              secondary={`Students: ${batch.student_count || 0}/${batch.max_students}`}
                            />
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    💡 You can assign the student to multiple batches
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={!assignmentData.course_id || assignmentData.batch_ids.length === 0}
            sx={{
              bgcolor: BLUE,
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              color: '#fff',
              '&:hover': { bgcolor: '#1565c0' },
            }}
          >
            Approve & Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentApproval;
