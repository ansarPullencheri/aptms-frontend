import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Close,
  Refresh,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";
const YELLOW = "#fbbc04";

const StudentProgressHistory = () => {
  const navigate = useNavigate();
  const { batchId, studentId } = useParams();
  
  const [studentData, setStudentData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchProgressReviews();
  }, [batchId, studentId, refreshTrigger]);

  const fetchProgressReviews = async () => {
    try {
      setLoading(true);
      console.log(`📍 Fetching reviews for student ${studentId} in batch ${batchId}`);
      
      const reviewsData = [];
      
      // ✅ Fetch all weeks (1-12)
      for (let week = 1; week <= 12; week++) {
        try {
          const response = await API.get(
            `/tasks/mentor/weekly-review/${batchId}/${studentId}/${week}/`
          );
          
          console.log(`✅ Week ${week} review found:`, response.data);
          
          // ✅ Check if feedback exists
          if (response.data.mentor_feedback || response.data.student_feedback) {
            console.log(`✅ Week ${week} has feedback - adding to list`);
          } else {
            console.log(`⚠️ Week ${week} exists but has NO feedback`);
          }
          
          // ✅ Add ALL reviews to the list
          reviewsData.push(response.data);
          
          // Set student data from first successful response
          if (!studentData && response.data.student) {
            setStudentData(response.data.student);
          }
        } catch (error) {
          console.log(`⚠️ Week ${week}: ${error.response?.status || error.message}`);
          // Continue to next week if this one doesn't exist
        }
      }
      
      console.log(`✅ Total reviews loaded: ${reviewsData.length}`);
      setReviews(reviewsData);
      
      if (reviewsData.length === 0) {
        setMessage({
          type: 'info',
          text: 'No progress reviews found for this student yet.',
        });
      } else {
        setMessage({
          type: 'success',
          text: `✅ Loaded ${reviewsData.length} review(s)`,
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
      
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      setMessage({
        type: 'error',
        text: `Error loading reviews: ${error.message}`,
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
    console.log('🔄 Refreshing...');
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: BLUE }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
          borderRadius: 2,
          color: BLUE,
          bgcolor: "#fff",
          border: `1px solid ${LIGHT_BLUE}`,
          '&:hover': { bgcolor: LIGHT_BLUE }
        }}
      >
        Back
      </Button>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${BLUE}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box flex={1}>
            <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700, mb: 1 }}>
              📋 Progress History
            </Typography>
            {studentData && (
              <Box >
                <Typography variant="body1" color="#223a5e" >
                  Student: <strong>{studentData.name}</strong> ({studentData.email})
                </Typography>
                <Typography variant="caption" color="#666">
                  Batch ID: {batchId} | Student ID: {studentId}
                </Typography>
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

      {/* Reviews Table */}
      {reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: `1.5px solid ${LIGHT_BLUE}` }}>
          <Typography variant="h6" color={BLUE} sx={{ mb: 1 }}>
            📋 No Reviews Found
          </Typography>
          <Typography color="#666" sx={{ mb: 3 }}>
            No progress reviews have been created for this student yet.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/mentor/weekly-review')}
              sx={{
                bgcolor: BLUE,
                color: '#fff',
                borderRadius: 2,
                fontWeight: 700,
                '&:hover': { bgcolor: "#003c8f" }
              }}
            >
              Create First Review
            </Button>
            <Button
              variant="outlined"
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
      ) : (
        <>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            ✅ Found {reviews.length} review(s)
          </Alert>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1.5px solid ${LIGHT_BLUE}`, overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Week</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Mentor Notes</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Student Feedback</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow
                    key={review.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: LIGHT_BLUE },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      Week {review.week_number}
                    </TableCell>
                    <TableCell>
                      {new Date(review.reviewed_at).toLocaleDateString()}
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
                          '&:hover': { bgcolor: LIGHT_BLUE, borderColor: BLUE }
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
        </>
      )}

      {/* Review Detail Dialog */}
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
          📋 Week {selectedReview?.week_number} Review
          <Button
            onClick={handleCloseDialog}
            sx={{ color: BLUE, minWidth: 'auto', p: 0 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 3 }}>
          {/* Mentor Notes Section */}
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
                  gap: 1
                }}
              >
                🔒 Mentor Notes
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
          ) : (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
              <Typography color="#999" variant="body2">
                No mentor notes for this week
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2.5 }} />

          {/* Student Feedback Section */}
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
                  gap: 1
                }}
              >
                💬 Student Feedback
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
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
              <Typography color="#999" variant="body2">
                No student feedback for this week
              </Typography>
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

export default StudentProgressHistory;
