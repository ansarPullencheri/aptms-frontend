import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Close,
  Refresh,
  RateReview,
  FilterList,
  Dashboard as DashboardIcon,
  Group,
  Assignment,
  Menu as MenuIcon,
  AddTask,
  Assessment,
} from '@mui/icons-material';

const BLUE = '#1976d2';
const LIGHT_GREY = '#f5f7fa';
const YELLOW = '#fbbc04';
const GREEN = '#4caf50';

const MentorReviewsView = () => {
  const navigate = useNavigate();
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filter states
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchStudents, setBatchStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('reviews');

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
    fetchAllReviews();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await API.get('/courses/mentor/batches/');
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const response = await API.get('/tasks/mentor/all-reviews/');

      setAllReviews(response.data.reviews || []);
      setFilteredReviews(response.data.reviews || []);

      if (response.data.reviews.length === 0) {
        setMessage({
          type: 'info',
          text: '📋 No reviews added yet.',
        });
      } else {
        setMessage({
          type: 'success',
          text: `✅ Loaded ${response.data.reviews.length} review(s)`,
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: `Error loading reviews: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (event) => {
    const batchId = event.target.value;
    setSelectedBatch(batchId);
    setSelectedStudent('');

    if (batchId) {
      const batch = batches.find((b) => b.id === parseInt(batchId));
      if (batch) {
        const students = [
          ...new Map(
            allReviews
              .filter((r) => r.batch_name === batch.name)
              .map((r) => [
                r.student_name,
                { name: r.student_name, username: r.student_username, email: r.student_email },
              ])
          ).values(),
        ];
        setBatchStudents(students);
      }
    } else {
      setBatchStudents([]);
    }

    applyFilters(batchId, selectedStudent);
  };

  const handleStudentChange = (event) => {
    const studentName = event.target.value;
    setSelectedStudent(studentName);
    applyFilters(selectedBatch, studentName);
  };

  const applyFilters = (batchId, studentName) => {
    let filtered = allReviews;

    if (batchId) {
      const batch = batches.find((b) => b.id === parseInt(batchId));
      if (batch) {
        filtered = filtered.filter((r) => r.batch_name === batch.name);
      }
    }

    if (studentName) {
      filtered = filtered.filter((r) => r.student_name === studentName);
    }

    setFilteredReviews(filtered);
  };

  const handleResetFilters = () => {
    setSelectedBatch('');
    setSelectedStudent('');
    setBatchStudents([]);
    setFilteredReviews(allReviews);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => setSelectedReview(null), 300);
  };

  const handleRefresh = () => {
    fetchAllReviews();
    handleResetFilters();
  };

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
              severity={message.type}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Filter Section */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <FilterList sx={{ color: BLUE }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                Filter Reviews
              </Typography>
            </Box>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Filter by Batch</InputLabel>
                  <Select
                    value={selectedBatch}
                    onChange={handleBatchChange}
                    label="Filter by Batch"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Batches</MenuItem>
                    {batches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" disabled={!selectedBatch} sx={{ minWidth: 140 }}>
                  <InputLabel>Filter by Student</InputLabel>
                  <Select
                    value={selectedStudent}
                    onChange={handleStudentChange}
                    label="Filter by Student"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Students</MenuItem>
                    {batchStudents.map((student) => (
                      <MenuItem key={student.name} value={student.name}>
                        {student.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleResetFilters}
                  sx={{
                    borderColor: BLUE,
                    color: BLUE,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>

            {/* Active Filters */}
            {(selectedBatch || selectedStudent) && (
              <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedBatch && (
                    <Chip
                      label={`Batch: ${batches.find((b) => b.id === parseInt(selectedBatch))?.name}`}
                      onDelete={() => {
                        setSelectedBatch('');
                        applyFilters('', selectedStudent);
                      }}
                      size="small"
                      sx={{ bgcolor: LIGHT_GREY, color: BLUE, fontWeight: 600 }}
                    />
                  )}
                  {selectedStudent && (
                    <Chip
                      label={`Student: ${selectedStudent}`}
                      onDelete={() => {
                        setSelectedStudent('');
                        applyFilters(selectedBatch, '');
                      }}
                      size="small"
                      sx={{ bgcolor: LIGHT_GREY, color: BLUE, fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>

          {/* No Reviews State */}
          {filteredReviews.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                bgcolor: '#fff',
              }}
            >
              <RateReview sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="#555" sx={{ mb: 1, fontWeight: 600 }}>
                📋 No Reviews Found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {allReviews.length === 0
                  ? "You haven't added any progress reviews yet."
                  : 'No reviews match your filter criteria.'}
              </Typography>
              {allReviews.length === 0 && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/mentor/weekly-review')}
                  sx={{
                    bgcolor: BLUE,
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { bgcolor: '#1565c0' },
                  }}
                >
                  Add First Review
                </Button>
              )}
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
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#555' }}>
                        Student
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#555' }}>
                        Batch
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#555' }}>
                        Week
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#555' }}>
                        Feedback
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#555' }}>
                        Notes
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#555' }}>
                        Date
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#555' }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReviews.map((review, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          '&:hover': { bgcolor: LIGHT_GREY },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: BLUE,
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {review.student_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {review.student_name}
                              </Typography>
                              <Typography variant="caption" color="#666">
                                @{review.student_username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color={BLUE}>
                            {review.batch_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`Week ${review.week_number}`}
                            size="small"
                            sx={{
                              bgcolor: LIGHT_GREY,
                              color: BLUE,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {review.mentor_feedback ? (
                            <Chip
                              label="✅ Yes"
                              size="small"
                              sx={{
                                bgcolor: YELLOW,
                                color: '#222',
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            <Chip
                              label="❌ No"
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: '#ccc',
                                color: '#999',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {review.student_feedback ? (
                            <Chip
                              label="✅ Yes"
                              size="small"
                              sx={{
                                bgcolor: GREEN,
                                color: '#fff',
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            <Chip
                              label="❌ No"
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: '#ccc',
                                color: '#999',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="#666">
                            {new Date(review.reviewed_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewReview(review)}
                            sx={{
                              borderColor: BLUE,
                              color: BLUE,
                              borderRadius: 1.5,
                              fontWeight: 600,
                              '&:hover': { bgcolor: '#e3f2fd', borderColor: BLUE },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Container>
      </Box>

      {/* Review Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle
          sx={{
            bgcolor: LIGHT_GREY,
            color: BLUE,
            fontWeight: 700,
            fontSize: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 1,
          }}
        >
          📋 Review - {selectedReview?.student_name} (Week {selectedReview?.week_number})
          <IconButton onClick={handleCloseDialog} sx={{ color: BLUE, p: 0 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {/* Student Info */}
          <Box sx={{ mb: 3, p: 2.5, bgcolor: LIGHT_GREY, borderRadius: 2, border: `1px solid #e0e0e0` }}>
            <Typography variant="subtitle2" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
              Student Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Name
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedReview?.student_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Email
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedReview?.student_email}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Batch
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedReview?.batch_name}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Mentor Notes */}
          {selectedReview?.mentor_feedback ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: YELLOW,
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                🔒 Mentor Notes (Private)
              </Typography>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: '#fef7e0',
                  borderLeft: `4px solid ${YELLOW}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                    color: '#333',
                  }}
                >
                  {selectedReview.mentor_feedback}
                </Typography>
              </Paper>
            </Box>
          ) : null}

          {selectedReview?.mentor_feedback && selectedReview?.student_feedback && <Divider sx={{ my: 3 }} />}

          {/* Student Feedback */}
          {selectedReview?.student_feedback ? (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: GREEN,
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                💬 Student Feedback (Visible to Student)
              </Typography>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: '#e8f5e9',
                  borderLeft: `4px solid ${GREEN}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                    color: '#333',
                  }}
                >
                  {selectedReview.student_feedback}
                </Typography>
              </Paper>
            </Box>
          ) : null}

          {!selectedReview?.mentor_feedback && !selectedReview?.student_feedback && (
            <Box sx={{ p: 3, bgcolor: LIGHT_GREY, borderRadius: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                No feedback added for this review
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid #e0e0e0` }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              bgcolor: BLUE,
              color: '#fff',
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#1565c0' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorReviewsView;
