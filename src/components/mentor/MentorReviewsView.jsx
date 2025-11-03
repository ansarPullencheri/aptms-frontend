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
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Close,
  Refresh,
  School,
  RateReview,
  FilterList,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";
const YELLOW = "#fbbc04";

const MentorReviewsView = () => {
  const navigate = useNavigate();
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // ✅ Filter states
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchStudents, setBatchStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchBatches();
    fetchAllReviews();
  }, []);

  // ✅ Fetch mentor's batches
  const fetchBatches = async () => {
    try {
      const response = await API.get('/courses/mentor/batches/');
      setBatches(response.data);
    } catch (error) {
      console.error('❌ Error fetching batches:', error);
    }
  };

  // ✅ Fetch all reviews
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      console.log('📍 Fetching all reviews...');
      
      const response = await API.get('/tasks/mentor/all-reviews/');
      
      console.log('✅ Reviews loaded:', response.data);
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
      console.error('❌ Error:', error);
      setMessage({
        type: 'error',
        text: `Error loading reviews: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle batch filter change
  const handleBatchChange = (event) => {
    const batchId = event.target.value;
    setSelectedBatch(batchId);
    setSelectedStudent(''); // Reset student filter
    
    if (batchId) {
      // Get students in selected batch
      const batch = batches.find(b => b.id === parseInt(batchId));
      if (batch) {
        // Get unique students from reviews in this batch
        const students = [...new Map(
          allReviews
            .filter(r => r.batch_name === batch.name)
            .map(r => [r.student_name, { name: r.student_name, username: r.student_username, email: r.student_email }])
        ).values()];
        setBatchStudents(students);
      }
    } else {
      setBatchStudents([]);
    }
    
    applyFilters(batchId, selectedStudent);
  };

  // ✅ Handle student filter change
  const handleStudentChange = (event) => {
    const studentName = event.target.value;
    setSelectedStudent(studentName);
    applyFilters(selectedBatch, studentName);
  };

  // ✅ Apply both filters
  const applyFilters = (batchId, studentName) => {
    let filtered = allReviews;
    
    if (batchId) {
      const batch = batches.find(b => b.id === parseInt(batchId));
      if (batch) {
        filtered = filtered.filter(r => r.batch_name === batch.name);
      }
    }
    
    if (studentName) {
      filtered = filtered.filter(r => r.student_name === studentName);
    }
    
    setFilteredReviews(filtered);
  };

  // ✅ Reset filters
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
    console.log('🔄 Refreshing...');
    fetchAllReviews();
    handleResetFilters();
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
        onClick={() => navigate('/mentor/dashboard')}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: BLUE, color: '#fff' }}>
                <RateReview sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700, mb: 0.5 }}>
                  📋 All Progress Reviews
                </Typography>
                <Typography variant="body2" color="#223a5e">
                  View and filter all reviews you have added to students
                </Typography>
              </Box>
            </Box>
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

      {/* ✅ FILTER SECTION */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: "#fff", border: `1px solid ${LIGHT_BLUE}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList sx={{ color: BLUE, fontWeight: 700 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BLUE }}>
            Filter Reviews
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Batch Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Batch</InputLabel>
              <Select
                value={selectedBatch}
                onChange={handleBatchChange}
                label="Filter by Batch"
                sx={{ borderRadius: 1.5 }}
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

          {/* Student Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small" disabled={!selectedBatch}>
              <InputLabel>Filter by Student</InputLabel>
              <Select
                value={selectedStudent}
                onChange={handleStudentChange}
                label="Filter by Student"
                sx={{ borderRadius: 1.5 }}
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

          {/* Reset Button */}
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleResetFilters}
              sx={{
                borderColor: BLUE,
                color: BLUE,
                borderRadius: 1.5,
                fontWeight: 600,
                '&:hover': { bgcolor: LIGHT_BLUE }
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {(selectedBatch || selectedStudent) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${LIGHT_BLUE}` }}>
            <Typography variant="caption" color="#666" sx={{ mb: 1, display: 'block' }}>
              Active Filters:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedBatch && (
                <Chip
                  label={`Batch: ${batches.find(b => b.id === parseInt(selectedBatch))?.name}`}
                  onDelete={() => { setSelectedBatch(''); applyFilters('', selectedStudent); }}
                  size="small"
                  sx={{ bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 600 }}
                />
              )}
              {selectedStudent && (
                <Chip
                  label={`Student: ${selectedStudent}`}
                  onDelete={() => { setSelectedStudent(''); applyFilters(selectedBatch, ''); }}
                  size="small"
                  sx={{ bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* No Reviews State */}
      {filteredReviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: `1.5px solid ${LIGHT_BLUE}` }}>
          <RateReview sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
          <Typography variant="h6" color={BLUE} sx={{ mb: 1 }}>
            📋 No Reviews Found
          </Typography>
          <Typography color="#666" sx={{ mb: 3 }}>
            {allReviews.length === 0 
              ? "You haven't added any progress reviews yet." 
              : "No reviews match your filter criteria."}
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
                '&:hover': { bgcolor: "#003c8f" }
              }}
            >
              Add First Review
            </Button>
          )}
        </Paper>
      ) : (
        <>
          

          <Paper elevation={0} sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1.5px solid ${LIGHT_BLUE}`,
            bgcolor: "#fff",
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Student
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Batch
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Week
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Feedback
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Notes
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Date
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
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
                        '&:hover': { bgcolor: LIGHT_BLUE },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: BLUE, color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
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
                            bgcolor: LIGHT_BLUE,
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
          </Paper>
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
          📋 Review - {selectedReview?.student_name} (Week {selectedReview?.week_number})
          <Button
            onClick={handleCloseDialog}
            sx={{ color: BLUE, minWidth: 'auto', p: 0 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 3 }}>
          {/* Student Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ color: BLUE, fontWeight: 700, mb: 1 }}>
              Student Information
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {selectedReview?.student_name}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {selectedReview?.student_email}
            </Typography>
            <Typography variant="body2">
              <strong>Batch:</strong> {selectedReview?.batch_name}
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5 }} />

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
                  gap: 1
                }}
              >
                🔒 Mentor Notes (Private)
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
          ) : null}

          {selectedReview?.mentor_feedback && selectedReview?.student_feedback && (
            <Divider sx={{ my: 2.5 }} />
          )}

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
                  gap: 1
                }}
              >
                💬 Student Feedback (Visible to Student)
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
          ) : null}

          {!selectedReview?.mentor_feedback && !selectedReview?.student_feedback && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
              <Typography color="#999" variant="body2">
                No feedback added for this review
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

export default MentorReviewsView;
