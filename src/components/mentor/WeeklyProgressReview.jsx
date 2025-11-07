import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  NavigateBefore,
  NavigateNext,
  Dashboard as DashboardIcon,
  Group,
  Assignment,
  Menu as MenuIcon,
  Close,
  AddTask,
  RateReview,
  Assessment,
  Email,
} from '@mui/icons-material';

const BLUE = '#1976d2';
const LIGHT_GREY = '#f5f7fa';
const YELLOW = '#fbbc04';
const GREEN = '#4caf50';

const WeeklyProgressReview = () => {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedBatchData, setSelectedBatchData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [weekNumber, setWeekNumber] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [feedback, setFeedback] = useState({
    mentor_feedback: '',
    student_feedback: '',
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('weekly-review');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/mentor/dashboard' },
    { id: 'batches', label: 'My Batches', icon: Group, path: '/mentor/batches' },
    { id: 'create-task', label: 'Create Task', icon: AddTask, path: '/mentor/create-task' },
    { id: 'tasks', label: 'Tasks', icon: Assignment, path: '/mentor/tasks' },
    { id: 'weekly-review', label: 'Weekly Review', icon: Assessment, path: '/mentor/weekly-review' },
    { id: 'reviews', label: 'My Reviews', icon: RateReview, path: '/mentor/reviews' },
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedStudent && weekNumber) {
      loadStudentFeedback();
    }
  }, [selectedStudent, weekNumber]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await API.get('/courses/mentor/batches/');
      const batchList = Array.isArray(response.data) ? response.data : response.data.batches || [];
      setBatches(batchList);

      if (batchList.length === 0) {
        setMessage({
          type: 'warning',
          text: 'No batches found.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to load batches: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = async (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    setSelectedStudent('');
    setSelectedStudentData(null);
    setStudents([]);
    setFeedback({ mentor_feedback: '', student_feedback: '' });

    if (batchId) {
      try {
        setLoadingStudents(true);
        const response = await API.get(`/tasks/mentor/batch/${batchId}/students/`);

        let studentsList = Array.isArray(response.data) ? response.data : response.data.students || [];

        setStudents(studentsList);
        const batch = batches.find((b) => b.id === parseInt(batchId));
        setSelectedBatchData(batch);

        if (studentsList.length === 0) {
          setMessage({
            type: 'warning',
            text: 'No students in this batch',
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: `Failed to load students: ${error.message}`,
        });
      } finally {
        setLoadingStudents(false);
      }
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);

    if (studentId) {
      const student = students.find((s) => s.id === parseInt(studentId));
      setSelectedStudentData(student);
    } else {
      setSelectedStudentData(null);
      setFeedback({ mentor_feedback: '', student_feedback: '' });
    }
  };

  const loadStudentFeedback = async () => {
    if (!selectedBatch || !selectedStudent || !weekNumber) return;

    try {
      const response = await API.get(
        `/tasks/mentor/weekly-review/${selectedBatch}/${selectedStudent}/${weekNumber}/`
      );

      setFeedback({
        mentor_feedback: response.data.mentor_feedback || '',
        student_feedback: response.data.student_feedback || '',
      });
    } catch (error) {
      setFeedback({ mentor_feedback: '', student_feedback: '' });
    }
  };

  const handleSaveReview = async () => {
    if (!selectedBatch || !selectedStudent || !weekNumber) {
      setMessage({
        type: 'error',
        text: 'Please select batch, student, and week',
      });
      return;
    }

    try {
      setSaving(true);

      const response = await API.post(
        `/tasks/mentor/weekly-review/${selectedBatch}/${selectedStudent}/${weekNumber}/`,
        feedback
      );

      setMessage({
        type: 'success',
        text: '✅ Progress review saved successfully!',
      });

      setTimeout(() => {
        navigate(`/mentor/student-progress/${selectedBatch}/${selectedStudent}`);
      }, 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error saving review: ${error.response?.data?.error || error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNextStudent = () => {
    const currentIndex = students.findIndex((s) => s.id === parseInt(selectedStudent));
    if (currentIndex < students.length - 1) {
      setSelectedStudent(students[currentIndex + 1].id.toString());
    }
  };

  const handlePreviousStudent = () => {
    const currentIndex = students.findIndex((s) => s.id === parseInt(selectedStudent));
    if (currentIndex > 0) {
      setSelectedStudent(students[currentIndex - 1].id.toString());
    }
  };

  const currentIndex = selectedStudent ? students.findIndex((s) => s.id === parseInt(selectedStudent)) + 1 : 0;

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
            Mentor
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
          const active = activeNav === item.id;
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
                backgroundColor: active ? BLUE : 'transparent',
                '&:hover': { backgroundColor: active ? BLUE : LIGHT_GREY },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#fff' : BLUE }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : '#333',
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
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box
          sx={{
            flex: 1,
            ml: sidebarOpen ? '220px' : '70px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            bgcolor: LIGHT_GREY,
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
        <Container maxWidth="xl" sx={{ py: 5 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/mentor/dashboard')}
            sx={{
              mb: 3,
              borderRadius: 2,
              color: BLUE,
              '&:hover': { bgcolor: '#e3f2fd' },
            }}
          >
            Back to Dashboard
          </Button>

         

          {/* Messages */}
          {message.text && (
            <Alert
              severity={message.type || 'info'}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Selection Section */}
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
            <Typography variant="h6" sx={{ mb: 3, color: '#222', fontWeight: 700 }}>
              📋 Select Details
            </Typography>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth sx={{ minWidth: 140 }}>
                  <InputLabel>Select Batch</InputLabel>
                  <Select
                    value={selectedBatch}
                    label="Select Batch"
                    onChange={handleBatchChange}
                    sx={{ borderRadius: 2, bgcolor: '#fff' }}
                  >
                    <MenuItem value="">-- Choose Batch --</MenuItem>
                    {batches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth disabled={!selectedBatch || loadingStudents} sx={{ minWidth: 140 }}>
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    value={selectedStudent}
                    label="Select Student"
                    onChange={handleStudentChange}
                    sx={{ borderRadius: 2, bgcolor: '#fff' }}
                  >
                    <MenuItem value="">-- Choose Student --</MenuItem>
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name || student.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth disabled={!selectedStudent}>
                  <InputLabel>Select Week</InputLabel>
                  <Select
                    value={weekNumber}
                    label="Select Week"
                    onChange={(e) => setWeekNumber(e.target.value)}
                    sx={{ borderRadius: 2, bgcolor: '#fff' }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        Week {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3} display="flex" alignItems="flex-end">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveReview}
                  disabled={saving || !selectedStudent}
                  sx={{
                    bgcolor: BLUE,
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': { bgcolor: '#1565c0' },
                    '&:disabled': { bgcolor: '#ccc' },
                  }}
                >
                  {saving ? 'Saving...' : ' Save'}
                </Button>
              </Grid>
            </Grid>

            {/* Navigation */}
            {selectedStudent && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: LIGHT_GREY,
                  borderRadius: 2,
                }}
              >
                <Chip
                  label={`Student ${currentIndex} of ${students.length}`}
                  sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}
                />
                <Button
                  size="small"
                  startIcon={<NavigateBefore />}
                  onClick={handlePreviousStudent}
                  disabled={currentIndex === 1}
                  variant="outlined"
                  sx={{ borderRadius: 2, color: BLUE, borderColor: BLUE }}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  endIcon={<NavigateNext />}
                  onClick={handleNextStudent}
                  disabled={currentIndex === students.length}
                  variant="outlined"
                  sx={{ borderRadius: 2, color: BLUE, borderColor: BLUE }}
                >
                  Next
                </Button>
              </Box>
            )}
          </Paper>

          {/* Feedback Section */}
          {selectedStudent ? (
            <Grid container spacing={3} >
              {/* Student Info Card */}
              <Grid item xs={12} md={4} >
                <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%', width: '450px', }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
                      👤 Student Info
                    </Typography>

                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Name
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {selectedStudentData?.name || selectedStudentData?.username}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: BLUE, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                          {selectedStudentData?.email || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Batch
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {selectedBatchData?.name}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        p: 2,
                        bgcolor: LIGHT_GREY,
                        borderRadius: 2,
                        textAlign: 'center',
                        border: `2px solid ${BLUE}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Review Week
                      </Typography>
                      <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700, mt: 0.5 }}>
                        {weekNumber}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Feedback Cards */}
              <Grid item xs={12} md={8}>
                {/* Mentor Feedback */}
                <Card sx={{ mb: 3, borderRadius: 3, border: `2px solid ${YELLOW}`,width: '450px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h6" sx={{ color: YELLOW, fontWeight: 700 }}>
                        📝 Mentor Feedback
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Add internal observations, areas to improve, strengths, etc...
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      placeholder="Write your feedback here..."
                      value={feedback.mentor_feedback}
                      onChange={(e) =>
                        setFeedback({ ...feedback, mentor_feedback: e.target.value })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        bgcolor: '#fff',
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Student Notes */}
                <Card sx={{ borderRadius: 3, border: `2px solid ${GREEN}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h6" sx={{ color: GREEN, fontWeight: 700 }}>
                        💬 Student Notes
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Positive feedback, encouragement, praise for good work...
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      placeholder="Write encouraging notes here..."
                      value={feedback.student_feedback}
                      onChange={(e) =>
                        setFeedback({ ...feedback, student_feedback: e.target.value })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        bgcolor: '#fff',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" color={BLUE} sx={{ mb: 2, fontWeight: 600 }}>
                 Select a student to add feedback
              </Typography>
              <Typography color="text.secondary">Choose batch → student → week to get started</Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default WeeklyProgressReview;
