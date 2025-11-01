import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Divider,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Grade,
  Search,
  Assessment,
  CheckCircle,
  PendingActions,
  Assignment,
  Download,
  Close
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";
const YELLOW = "#fbbc04";
const RED = "#f44336";

const GradeSubmissions = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  
  // Data states
  const [batchData, setBatchData] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // UI states
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTask, setFilterTask] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Grade data
  const [gradeData, setGradeData] = useState({
    marks_obtained: '',
    feedback: '',
  });

  useEffect(() => {
    fetchBatchSubmissions();
  }, [batchId]);

  const fetchBatchSubmissions = async () => {
    try {
      setLoading(true);
      console.log(`📍 Fetching batch submissions for batch: ${batchId}`);
      const response = await API.get(`/tasks/mentor/batch/${batchId}/submissions/`);
      console.log('✅ Batch submissions loaded:', response.data);
      setBatchData(response.data);
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load submissions: ${error.response?.data?.error || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch detailed submission with file and text
  const handleViewSubmission = async (submission) => {
    try {
      setDetailLoading(true);
      console.log('📍 Fetching submission ID:', submission.submission_id);
      
      const response = await API.get(`/tasks/mentor/submissions/${submission.submission_id}/`);
      
      console.log('✅ Submission Detail Response:', response.data);
      console.log('📝 Submission Text:', response.data.submission_text);
      console.log('📎 Submission File:', response.data.submission_file);
      
      setSubmissionDetail(response.data);
      setSelectedSubmission(submission);
      setOpenDetailDialog(true);
    } catch (error) {
      console.error('❌ Error fetching submission detail:', error);
      console.error('❌ Error Status:', error.response?.status);
      console.error('❌ Error Data:', error.response?.data);
      console.error('❌ Error Message:', error.message);
      
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      setMessage({ 
        type: 'error', 
        text: `Failed to load submission details: ${errorMsg}` 
      });
    } finally {
      setDetailLoading(false);
    }
  };

  // ✅ Handle row click
  const handleRowClick = async (submission) => {
    console.log('🖱️ Row clicked:', submission);
    await handleViewSubmission(submission);
  };

  // Calculate statistics
  const getStatistics = () => {
    if (!batchData) return { total: 0, graded: 0, pending: 0, avgScore: 0 };

    const allSubmissions = batchData.tasks.flatMap(task => task.submissions);
    const graded = allSubmissions.filter(s => s.is_graded);
    const pending = allSubmissions.filter(s => !s.is_graded);
    
    const avgScore = graded.length > 0
      ? (graded.reduce((sum, s) => sum + (s.marks_obtained || 0), 0) / graded.length).toFixed(1)
      : 0;

    return {
      total: allSubmissions.length,
      graded: graded.length,
      pending: pending.length,
      avgScore
    };
  };

  // Get all submissions (flattened)
  const getAllSubmissions = () => {
    if (!batchData) return [];
    
    return batchData.tasks.flatMap(task =>
      task.submissions.map(submission => ({
        ...submission,
        task_title: task.task_title,
        max_marks: task.max_marks,
        task_id: task.task_id,
        due_date: task.due_date
      }))
    );
  };

  // Filter submissions based on tab, search, and filters
  const getFilteredSubmissions = () => {
    let submissions = getAllSubmissions();

    // Tab filter
    if (tabValue === 1) {
      submissions = submissions.filter(s => !s.is_graded); // Pending
    } else if (tabValue === 2) {
      submissions = submissions.filter(s => s.is_graded); // Graded
    }

    // Search filter
    if (searchQuery) {
      submissions = submissions.filter(s =>
        s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Task filter
    if (filterTask !== 'all') {
      submissions = submissions.filter(s => s.task_id === parseInt(filterTask));
    }

    // Status filter
    if (filterStatus === 'graded') {
      submissions = submissions.filter(s => s.is_graded);
    } else if (filterStatus === 'pending') {
      submissions = submissions.filter(s => !s.is_graded);
    }

    return submissions;
  };

  const handleOpenGradeDialog = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      marks_obtained: submission.marks_obtained || '',
      feedback: submission.feedback || '',
    });
    setOpenGradeDialog(true);
  };

  const handleCloseGradeDialog = () => {
    setOpenGradeDialog(false);
    setGradeData({ marks_obtained: '', feedback: '' });
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSubmissionDetail(null);
  };

  const handleGradeSubmit = async () => {
    try {
      if (!gradeData.marks_obtained) {
        setMessage({ type: 'error', text: 'Please enter marks' });
        return;
      }

      const marks = parseFloat(gradeData.marks_obtained);
      if (marks > selectedSubmission.max_marks) {
        setMessage({ 
          type: 'error', 
          text: `Marks cannot exceed ${selectedSubmission.max_marks}` 
        });
        return;
      }

      console.log('📤 Submitting grade:', gradeData);
      
      await API.post(
        `/tasks/mentor/submissions/${selectedSubmission.submission_id}/grade/`,
        gradeData
      );
      
      setMessage({ type: 'success', text: 'Submission graded successfully!' });
      fetchBatchSubmissions();
      handleCloseGradeDialog();
      handleCloseDetailDialog();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error grading submission:', error);
      setMessage({ 
        type: 'error', 
        text: `Error grading submission: ${error.response?.data?.error || error.message}` 
      });
    }
  };

  const handleDownloadFile = () => {
    if (submissionDetail?.submission_file) {
      console.log('📥 Downloading file:', submissionDetail.submission_file);
      window.open(submissionDetail.submission_file, '_blank');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: BLUE }} />
      </Box>
    );
  }

  const statistics = getStatistics();
  const filteredSubmissions = getFilteredSubmissions();
  const paginatedSubmissions = filteredSubmissions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
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

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${BLUE}` }}>
        <Typography variant="h4" gutterBottom sx={{ color: BLUE, fontWeight: 700 }}>
          Grade Submissions
        </Typography>
        <Typography variant="body1" color="#223a5e">
          Batch: <strong>{batchData?.batch_name}</strong> | Course: <strong>{batchData?.course_name}</strong>
        </Typography>
      </Paper>

      {message.text && (
        <Alert 
          severity={message.type || "info"} 
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${BLUE}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700 }}>
                    {statistics.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Submissions
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: BLUE }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${GREEN}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: GREEN, fontWeight: 700 }}>
                    {statistics.graded}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Graded
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: GREEN }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${YELLOW}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: YELLOW, fontWeight: 700 }}>
                    {statistics.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                <PendingActions sx={{ fontSize: 40, color: YELLOW }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${BLUE}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700 }}>
                    {statistics.avgScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, color: BLUE }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Filters */}
      <Paper sx={{ borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}`, mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue);
            setPage(0);
          }}
          sx={{
            borderBottom: 1,
            borderColor: LIGHT_BLUE,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            }
          }}
        >
          <Tab label={`All (${getAllSubmissions().length})`} />
          <Tab label={`Pending (${statistics.pending})`} />
          <Tab label={`Graded (${statistics.graded})`} />
        </Tabs>

        {/* Filters */}
        <Box sx={{ p: 2, bgcolor: LIGHT_BLUE, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search student..."
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: BLUE }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: '#fff',
              borderRadius: 1,
              minWidth: 250
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200, bgcolor: '#fff', borderRadius: 1 }}>
            <InputLabel>Filter by Task</InputLabel>
            <Select
              value={filterTask}
              label="Filter by Task"
              onChange={(e) => {
                setFilterTask(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Tasks</MenuItem>
              {batchData?.tasks.map(task => (
                <MenuItem key={task.task_id} value={task.task_id}>
                  {task.task_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150, bgcolor: '#fff', borderRadius: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="graded">Graded</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" color={BLUE} fontWeight={600}>
              Showing {filteredSubmissions.length} result{filteredSubmissions.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        {/* Submissions Table - ✅ CLICKABLE ROWS */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: LIGHT_BLUE }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: BLUE }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, color: BLUE }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 700, color: BLUE }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 700, color: BLUE }}>Marks</TableCell>
                <TableCell sx={{ fontWeight: 700, color: BLUE }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No submissions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((submission) => (
                  <TableRow
                    key={submission.submission_id}
                    onClick={() => handleRowClick(submission)}
                    sx={{
                      '&:hover': {
                        bgcolor: LIGHT_BLUE,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(21,101,192,0.1)'
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: BLUE,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#fff'
                          }}
                        >
                          {submission.student_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {submission.student_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {submission.student_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {submission.task_title}
                      </Typography>
                      <Typography variant="caption" color={BLUE}>
                        Max: {submission.max_marks}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(submission.submitted_at).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {submission.marks_obtained !== null ? (
                        <Chip
                          label={`${submission.marks_obtained}/${submission.max_marks}`}
                          size="small"
                          sx={{
                            bgcolor: GREEN,
                            color: '#fff',
                            fontWeight: 700
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.is_graded ? 'Graded' : 'Pending'}
                        size="small"
                        sx={{
                          bgcolor: submission.is_graded ? GREEN : YELLOW,
                          color: submission.is_graded ? '#fff' : '#222',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Grade />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenGradeDialog(submission);
                        }}
                        sx={{
                          bgcolor: BLUE,
                          color: "#fff",
                          borderRadius: 2,
                          fontWeight: 600,
                          '&:hover': { bgcolor: "#003c8f" }
                        }}
                      >
                        {submission.is_graded ? 'Edit' : 'Grade'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredSubmissions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: `1px solid ${LIGHT_BLUE}`,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              color: BLUE,
              fontWeight: 500
            }
          }}
        />
      </Paper>

      {/* ✅ View Submission Detail Dialog */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          bgcolor: BLUE, 
          color: '#fff', 
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>Submission Details</Box>
          <IconButton
            onClick={handleCloseDetailDialog}
            sx={{ color: '#fff' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {detailLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: BLUE }} />
            </Box>
          ) : submissionDetail ? (
            <Box>
              {/* Student Info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: LIGHT_BLUE, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: BLUE, fontWeight: 700, mb: 1 }}>
                  👤 Student Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#223a5e">Name</Typography>
                    <Typography variant="body2" fontWeight={600}>{submissionDetail.student.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#223a5e">Username</Typography>
                    <Typography variant="body2" fontWeight={600}>{submissionDetail.student.username}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="#223a5e">Email</Typography>
                    <Typography variant="body2" fontWeight={600}>{submissionDetail.student.email}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Task Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
                  📋 Task Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9', border: `1px solid ${LIGHT_BLUE}` }}>
                      <Typography variant="caption" color="#223a5e">Task Title</Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: BLUE, mt: 0.5 }}>
                        {submissionDetail.task.title}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#223a5e">Max Marks</Typography>
                    <Typography variant="body2" fontWeight={600}>{submissionDetail.task.max_marks}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#223a5e">Due Date</Typography>
                    <Typography variant="body2">{new Date(submissionDetail.task.due_date).toLocaleDateString()}</Typography>
                  </Grid>
                  {submissionDetail.task.description && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="#223a5e">Description</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#333', whiteSpace: 'pre-wrap' }}>
                        {submissionDetail.task.description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Submission Content */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
                  📤 Submitted Content
                </Typography>

                {submissionDetail.submission_text || submissionDetail.submission_file ? (
                  <>
                    {/* Submission Text */}
                    {submissionDetail.submission_text && (
                      <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" color="#223a5e" fontWeight={700} display="block" mb={1}>
                          📝 Submission Text
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-wrap', 
                            color: '#333',
                            lineHeight: 1.6,
                            maxHeight: 300,
                            overflow: 'auto'
                          }}
                        >
                          {submissionDetail.submission_text}
                        </Typography>
                      </Box>
                    )}

                    {/* Submission File Download */}
                    {submissionDetail.submission_file && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="#223a5e" fontWeight={700} display="block" mb={1}>
                          📎 Attached File
                        </Typography>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={handleDownloadFile}
                          sx={{
                            borderColor: BLUE,
                            color: BLUE,
                            borderRadius: 2,
                            fontWeight: 600,
                            py: 1.2,
                            '&:hover': { bgcolor: LIGHT_BLUE }
                          }}
                        >
                          Download Submitted File
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Paper sx={{ p: 2, bgcolor: '#fff0f0', border: '1px solid #ffcdd2' }}>
                    <Typography variant="body2" color="text.secondary">
                      ⚠️ No submission content found
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Submission Meta */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 2, bgcolor: LIGHT_BLUE, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#223a5e">Submitted At</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(submissionDetail.submitted_at).toLocaleDateString()} {new Date(submissionDetail.submitted_at).toLocaleTimeString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#223a5e">Status</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {submissionDetail.status || 'Submitted'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Grading Info */}
              {submissionDetail.is_graded && (
                <Box sx={{ mt: 3, p: 2, bgcolor: GREEN, borderRadius: 2, color: '#fff' }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    ✓ Grading Status
                  </Typography>
                  <Typography variant="body2">
                    <strong>Marks Obtained:</strong> {submissionDetail.marks_obtained}/{submissionDetail.task.max_marks}
                  </Typography>
                  {submissionDetail.feedback && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Feedback:</strong> {submissionDetail.feedback}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="error">No submission details available</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseDetailDialog}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          {selectedSubmission && (
            <Button
              variant="contained"
              startIcon={<Grade />}
              onClick={() => {
                handleCloseDetailDialog();
                handleOpenGradeDialog(selectedSubmission);
              }}
              sx={{
                bgcolor: BLUE,
                color: "#fff",
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': { bgcolor: "#003c8f" }
              }}
            >
              {selectedSubmission.is_graded ? 'Edit Grade' : 'Grade Now'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog 
        open={openGradeDialog} 
        onClose={handleCloseGradeDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
          Grade Submission - {selectedSubmission?.student_name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 2, p: 2, bgcolor: LIGHT_BLUE, borderRadius: 2 }}>
            <Typography variant="body2" color={BLUE} gutterBottom>
              <strong>Task:</strong> {selectedSubmission?.task_title}
            </Typography>
            <Typography variant="body2" color={BLUE} gutterBottom>
              <strong>Maximum Marks:</strong> {selectedSubmission?.max_marks}
            </Typography>
            <Typography variant="body2" color={BLUE}>
              <strong>Submitted:</strong> {selectedSubmission && new Date(selectedSubmission.submitted_at).toLocaleDateString()}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Marks Obtained"
            type="number"
            value={gradeData.marks_obtained}
            onChange={(e) =>
              setGradeData({ ...gradeData, marks_obtained: e.target.value })
            }
            sx={{ mb: 2 }}
            inputProps={{
              max: selectedSubmission?.max_marks,
              min: 0,
              step: 0.5
            }}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Feedback"
            multiline
            rows={4}
            value={gradeData.feedback}
            onChange={(e) =>
              setGradeData({ ...gradeData, feedback: e.target.value })
            }
            placeholder="Provide detailed feedback to the student..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseGradeDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleGradeSubmit}
            variant="contained"
            startIcon={<Grade />}
            sx={{
              bgcolor: BLUE,
              color: "#fff",
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': { bgcolor: "#003c8f" }
            }}
          >
            Submit Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GradeSubmissions;
