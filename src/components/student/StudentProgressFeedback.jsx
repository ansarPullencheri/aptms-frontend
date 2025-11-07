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
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Close,
  Refresh,
  RateReview,
  Dashboard as DashboardIcon,
  Assignment,
  CheckCircle,
  Menu as MenuIcon,
} from '@mui/icons-material';

const BLUE = "#1976d2";
const LIGHT_GREY = "#f5f7fa";

const StudentProgressFeedback = () => {
  const navigate = useNavigate();
  const [batchData, setBatchData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('feedback');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: Assignment, path: '/student/tasks' },
    { id: 'submissions', label: 'Submissions', icon: CheckCircle, path: '/student/submissions' },
    { id: 'feedback', label: 'My Feedback', icon: RateReview, path: '/student/progress-feedback' },
  ];

  useEffect(() => {
    fetchStudentReviews();
  }, []);

  const fetchStudentReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = [];
      
      for (let week = 1; week <= 12; week++) {
        try {
          const response = await API.get(`/tasks/student/weekly-review/${week}/`);
          
          if (response.data.student_feedback || response.data.mentor_feedback) {
            reviewsData.push(response.data);
            
            if (!batchData && response.data.batch) {
              setBatchData(response.data.batch);
            }
          }
        } catch (error) {
          // Week not found or no data
        }
      }
      
      setReviews(reviewsData);
      
      if (reviewsData.length === 0) {
        setMessage({
          type: 'info',
          text: 'No feedback has been provided yet. Check back soon!',
        });
      } else {
        setMessage({
          type: 'success',
          text: `Loaded ${reviewsData.length} feedback(s)`,
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error loading feedback: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
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
    fetchStudentReviews();
  };

  const Sidebar = () => (
    <Box
      sx={{
        width: sidebarOpen ? 220 : 70,
        height: '100vh',
        bgcolor: "#fff",
        borderRight: "1px solid #e0e0e0",
        transition: "width 0.25s ease",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 6px rgba(0,0,0,0.04)",
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          p: 2,
        }}
      >
        {sidebarOpen && (
          <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700 }}>
            Student
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
                backgroundColor: active ? BLUE : "transparent",
                "&:hover": { backgroundColor: active ? BLUE : LIGHT_GREY },
              }}
            >
              <ListItemIcon sx={{ color: active ? "#fff" : BLUE }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "#333",
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: LIGHT_GREY,
        }}
      >
        <CircularProgress sx={{ color: BLUE }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? "220px" : "70px", transition: "margin 0.25s ease" }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/student/dashboard')}
            sx={{
              mb: 3,
              color: BLUE,
              fontWeight: 600,
              '&:hover': { bgcolor: LIGHT_GREY }
            }}
          >
            Back to Dashboard
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 700, color: "#222", mb: 4 }}>
            My Feedback 📋
          </Typography>

          {/* Header Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              bgcolor: "#fff"
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#222", mb: 1 }}>
                  Weekly Mentor Feedback
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review your mentor's feedback and progress notes
                </Typography>
                {batchData && (
                  <Chip
                    label={batchData.name}
                    size="small"
                    sx={{
                      bgcolor: LIGHT_GREY,
                      color: BLUE,
                      fontWeight: 600,
                      mt: 2
                    }}
                  />
                )}
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                sx={{
                  color: BLUE,
                  borderColor: "#e0e0e0",
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: BLUE,
                    bgcolor: LIGHT_GREY
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Paper>

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

          {/* No Reviews State */}
          {reviews.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                bgcolor: "#fff"
              }}
            >
              <RateReview sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
              <Typography variant="h6" color="#555" sx={{ mb: 1 }}>
                No Feedback Yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Your mentor hasn't provided any feedback yet. Keep an eye on this page!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                sx={{
                  bgcolor: BLUE,
                  fontWeight: 600,
                  '&:hover': { bgcolor: "#1565c0" }
                }}
              >
                Check Again
              </Button>
            </Paper>
          ) : (
            <>
              <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
                You have {reviews.length} feedback(s) from your mentor
              </Alert>

              <Grid container spacing={3}>
                {reviews.map((review) => (
                  <Grid item xs={12} sm={6} md={4} key={review.id || review.week_number}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: "1px solid #e0e0e0",
                        height: '100%',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        bgcolor: "#fff",
                        '&:hover': {
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => handleViewReview(review)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: BLUE,
                              fontWeight: 700,
                            }}
                          >
                            Week {review.week_number}
                          </Typography>
                          <Chip
                            icon={<Visibility sx={{ fontSize: 14 }} />}
                            label="View"
                            size="small"
                            sx={{
                              bgcolor: BLUE,
                              color: '#fff',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          />
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {review.student_feedback && (
                            <Chip
                              label="Feedback"
                              size="small"
                              sx={{
                                bgcolor: "#4caf50",
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                          )}
                          {review.mentor_feedback && (
                            <Chip
                              label="Notes"
                              size="small"
                              sx={{
                                bgcolor: "#ff9800",
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          {review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString() : 'Pending'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Feedback Detail Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle
              sx={{
                bgcolor: LIGHT_GREY,
                color: BLUE,
                fontWeight: 700,
                fontSize: '1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pr: 1
              }}
            >
              Week {selectedReview?.week_number} Feedback
              <IconButton
                onClick={handleCloseDialog}
                sx={{ color: BLUE, p: 0 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2.5 }}>
              {selectedReview?.student_feedback ? (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#555",
                      fontWeight: 700,
                      mb: 1.5,
                    }}
                  >
                    Mentor Feedback
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      bgcolor: LIGHT_GREY,
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.7,
                        color: "text.secondary"
                      }}
                    >
                      {selectedReview.student_feedback}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ mb: 3, p: 2, bgcolor: LIGHT_GREY, borderRadius: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    No feedback for this week
                  </Typography>
                </Box>
              )}

              {selectedReview?.mentor_feedback && (
                <>
                  <Divider sx={{ my: 2.5 }} />
                  
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#555",
                        fontWeight: 700,
                        mb: 1.5,
                      }}
                    >
                      Additional Notes
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        bgcolor: "#fffbf0",
                        border: "1px solid #ffe0b2",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.7,
                          color: "text.secondary"
                        }}
                      >
                        {selectedReview.mentor_feedback}
                      </Typography>
                    </Paper>
                  </Box>
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e0e0e0" }}>
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  bgcolor: BLUE,
                  fontWeight: 600,
                  '&:hover': { bgcolor: "#1565c0" }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentProgressFeedback;
