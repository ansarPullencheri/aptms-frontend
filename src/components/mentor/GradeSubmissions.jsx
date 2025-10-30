import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, CircularProgress, Chip, Alert, Grid, Card,
  CardContent, Tabs, Tab, InputAdornment, IconButton, Collapse, MenuItem,
  Select, FormControl, InputLabel, TablePagination, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack, Grade, Search, FilterList, ExpandMore, Assessment,
  CheckCircle, PendingActions, Assignment
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";
const YELLOW = "#fbbc04";

const GradeSubmissions = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  
  // Data states
  const [batchData, setBatchData] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // UI states
  const [openDialog, setOpenDialog] = useState(false);
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
      const response = await API.get(`/tasks/mentor/batch/${batchId}/submissions/`);
      setBatchData(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubmission(null);
  };

  const handleGradeSubmit = async () => {
    try {
      await API.patch(
        `/tasks/submissions/${selectedSubmission.submission_id}/grade/`,
        gradeData
      );
      setMessage('Submission graded successfully!');
      fetchBatchSubmissions();
      handleCloseDialog();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error grading submission');
      console.error('Error:', error);
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

      {message && (
        <Alert severity={message.includes('Error') ? "error" : "success"} sx={{ mb: 2, borderRadius: 2 }}>
          {message}
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

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}`, mb: 3 }}>
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

        {/* Submissions Table */}
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
                    sx={{ '&:hover': { bgcolor: LIGHT_BLUE } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {submission.student_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {submission.student_email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {submission.task_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(submission.submitted_at).toLocaleDateString()}
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
                          Not graded
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
                        onClick={() => handleOpenGradeDialog(submission)}
                        sx={{
                          bgcolor: BLUE,
                          color: "#fff",
                          borderRadius: 2,
                          fontWeight: 700,
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

      {/* Grade Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
          Grade Submission - {selectedSubmission?.student_name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 2, p: 2, bgcolor: LIGHT_BLUE, borderRadius: 2 }}>
            <Typography variant="body2" color={BLUE} gutterBottom>
              <strong>Task:</strong> {selectedSubmission?.task_title}
            </Typography>
            <Typography variant="body2" color={BLUE}>
              <strong>Maximum Marks:</strong> {selectedSubmission?.max_marks}
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
              min: 0
            }}
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
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>
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
              fontWeight: 600
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
