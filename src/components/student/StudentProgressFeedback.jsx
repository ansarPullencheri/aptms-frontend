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
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Close,
  Refresh,
  School,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";
const YELLOW = "#fbbc04";

const StudentProgressFeedback = () => {
  const navigate = useNavigate();
  const [batchData, setBatchData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudentReviews();
  }, []);

  const fetchStudentReviews = async () => {
    try {
      setLoading(true);
      console.log('📍 Fetching student progress reviews...');
      
      const reviewsData = [];
      
      // ✅ Fetch all weeks (1-12)
      for (let week = 1; week <= 12; week++) {
        try {
          const response = await API.get(`/tasks/student/weekly-review/${week}/`);
          
          console.log(`✅ Week ${week} review found:`, response.data);
          
          // ✅ IMPORTANT: Only add if HAS feedback
          if (response.data.student_feedback || response.data.mentor_feedback) {
            reviewsData.push(response.data);
            
            if (!batchData && response.data.batch) {
              setBatchData(response.data.batch);
            }
          } else {
            console.log(`⚠️ Week ${week}: No feedback yet`);
          }
        } catch (error) {
          console.log(`⚠️ Week ${week}: ${error.response?.status || error.message}`);
        }
      }
      
      console.log(`✅ Total reviews with feedback: ${reviewsData.length}`);
      setReviews(reviewsData);
      
      if (reviewsData.length === 0) {
        setMessage({
          type: 'info',
          text: '📋 No feedback has been provided yet. Check back soon!',
        });
      } else {
        setMessage({
          type: 'success',
          text: `✅ Loaded ${reviewsData.length} feedback(s)`,
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
      
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
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
    console.log('🔄 Refreshing feedback...');
    fetchStudentReviews();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: BLUE }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/student/dashboard')}
        sx={{
          mb: 2,
          borderRadius: 2,
          color: BLUE,
          bgcolor: "#fff",
          border: `1px solid ${LIGHT_BLUE}`,
          '&:hover': { bgcolor: LIGHT_BLUE }
        }}
      >
        Back to Dashboard
      </Button>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${BLUE}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box flex={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: BLUE, color: '#fff' }}>
                <School sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700, mb: 0.5 }}>
                  📋 My Weekly Feedback
                </Typography>
                <Typography variant="body2" color="#223a5e">
                  Review your mentor's feedback and progress notes
                </Typography>
              </Box>
            </Box>
            {batchData && (
              <Box>
                <Chip
                  label={batchData.name}
                  sx={{
                    bgcolor: LIGHT_BLUE,
                    color: BLUE,
                    fontWeight: 700,
                    mr: 1,
                  }}
                />
              </Box>
            )}
          </Box>
          
          {/* Refresh Button */}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              borderColor: BLUE,
              color: BLUE,
              borderRadius: 2,
              fontWeight: 700,
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
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* No Reviews State */}
      {reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: `1.5px solid ${LIGHT_BLUE}` }}>
          <School sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
          <Typography variant="h6" color={BLUE} sx={{ mb: 1 }}>
            📋 No Feedback Yet
          </Typography>
          <Typography color="#666" sx={{ mb: 3 }}>
            Your mentor hasn't provided any feedback yet. Keep an eye on this page!
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              borderColor: BLUE,
              color: BLUE,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Check Again
          </Button>
        </Paper>
      ) : (
        <>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            ✅ You have {reviews.length} feedback(s) from your mentor
          </Alert>

          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid item xs={12} sm={6} md={4} key={review.id || review.week_number}>
                <Card
                  sx={{
                    borderRadius: 2,
                    border: `2px solid ${LIGHT_BLUE}`,
                    height: '100%',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      border: `2px solid ${BLUE}`,
                      boxShadow: `0 8px 24px rgba(21,101,192,0.15)`,
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => handleViewReview(review)}
                >
                  <CardContent sx={{ p: 2 }}>
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
                        label="View"
                        size="small"
                        icon={<Visibility sx={{ fontSize: 14 }} />}
                        sx={{
                          bgcolor: BLUE,
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      {review.student_feedback && (
                        <Chip
                          label="💬 Feedback"
                          size="small"
                          sx={{
                            bgcolor: GREEN,
                            color: '#fff',
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {review.mentor_feedback && (
                        <Chip
                          label="🔒 Notes"
                          size="small"
                          sx={{
                            bgcolor: YELLOW,
                            color: '#222',
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="#666">
                      📅 {review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString() : 'Pending'}
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
            bgcolor: LIGHT_BLUE,
            color: BLUE,
            fontWeight: 700,
            fontSize: '1.3rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 1
          }}
        >
          📋 Week {selectedReview?.week_number} Feedback
          <Button
            onClick={handleCloseDialog}
            sx={{ color: BLUE, minWidth: 'auto', p: 0 }}
          >
            <Close />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {/* Student Feedback (Visible to student) */}
          {selectedReview?.student_feedback ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: GREEN,
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                💬 Mentor's Feedback
              </Typography>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: '#e8f5e9',
                  borderLeft: `4px solid ${GREEN}`,
                  borderRadius: 1,
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                    color: '#333'
                  }}
                >
                  {selectedReview.student_feedback}
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
              <Typography color="#999" variant="body2">
                No feedback for this week
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2.5 }} />

          {/* Mentor Internal Notes */}
          {selectedReview?.mentor_feedback && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: YELLOW,
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                🔒 Additional Notes
              </Typography>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: '#fef7e0',
                  borderLeft: `4px solid ${YELLOW}`,
                  borderRadius: 1,
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                    color: '#333'
                  }}
                >
                  {selectedReview.mentor_feedback}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${LIGHT_BLUE}` }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              bgcolor: BLUE,
              color: '#fff',
              borderRadius: 1.5,
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: "#003c8f" }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentProgressFeedback;
