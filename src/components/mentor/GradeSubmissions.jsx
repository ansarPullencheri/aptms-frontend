import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, CircularProgress, Chip, Alert,
} from '@mui/material';
import { ArrowBack, Grade } from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const GradeSubmissions = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batchData, setBatchData] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [gradeData, setGradeData] = useState({
    marks_obtained: '',
    feedback: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchBatchSubmissions(); }, [batchId]);
  const fetchBatchSubmissions = async () => {
    try {
      const response = await API.get(`/tasks/mentor/batch/${batchId}/submissions/`);
      setBatchData(response.data);
    } catch { } finally { setLoading(false); }
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
    } catch {
      setMessage('Error grading submission');
    }
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
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/mentor/dashboard')}
        sx={{
          mb: 2, borderRadius: 2, color: BLUE, bgcolor: "#fff",
          borderColor: LIGHT_BLUE, boxShadow: 'none',
          '&:hover': { bgcolor: LIGHT_BLUE }
        }}
      >
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${BLUE}` }}>
        <Typography variant="h4" gutterBottom sx={{ color: BLUE }}>
          Grade Submissions
        </Typography>
        <Typography color="#223a5e">
          Batch: {batchData?.batch_name} | Course: {batchData?.course_name}
        </Typography>
      </Paper>

      {message && (
        <Alert severity={message.includes('Error') ? "error" : "success"} sx={{ mb: 2, borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      {batchData?.tasks.map((task) => (
        <Paper key={task.task_id}
          sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${LIGHT_BLUE}` }}>
          <Typography variant="h6" gutterBottom sx={{ color: BLUE }}>
            {task.task_title}
          </Typography>
          <Box display="flex" gap={2} mb={2}>
            <Chip label={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
              sx={{ bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 700 }} />
            <Chip label={`Max Marks: ${task.max_marks}`}
              sx={{ bgcolor: BLUE, color: "#fff", fontWeight: 700 }} />
            <Chip label={`Submitted: ${task.total_submitted}/${task.total_assigned}`}
              sx={{ bgcolor: "#009688", color: "#fff", fontWeight: 700 }} />
          </Box>
          {task.submissions.length === 0 ? (
            <Typography color="#223a5e" align="center" sx={{ py: 2 }}>
              No submissions yet
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Submitted At</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {task.submissions.map((submission) => (
                    <TableRow key={submission.submission_id}
                      sx={{ '&:hover': { bgcolor: LIGHT_BLUE } }}>
                      <TableCell>{submission.student_name}</TableCell>
                      <TableCell>{submission.student_email}</TableCell>
                      <TableCell>
                        {new Date(submission.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {submission.marks_obtained !== null
                          ? `${submission.marks_obtained}/${task.max_marks}`
                          : 'Not Graded'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.is_graded ? 'Graded' : 'Pending'}
                          sx={{
                            bgcolor: submission.is_graded ? "#009688" : "#fbbc04",
                            color: submission.is_graded ? "#fff" : "#222",
                            fontWeight: 700,
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Grade />}
                          onClick={() => handleOpenGradeDialog({
                            ...submission,
                            task_title: task.task_title,
                            max_marks: task.max_marks,
                          })}
                          sx={{
                            bgcolor: BLUE, color: "#fff", borderRadius: 2, fontWeight: 700,
                            '&:hover': { bgcolor: "#003c8f" }
                          }}
                        >
                          {submission.is_graded ? 'Edit Grade' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      ))}

      {/* Grade Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Grade Submission - {selectedSubmission?.student_name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#223a5e" gutterBottom>
            Task: {selectedSubmission?.task_title}
          </Typography>
          <Typography variant="body2" color="#223a5e" gutterBottom>
            Maximum Marks: {selectedSubmission?.max_marks}
          </Typography>
          <TextField
            fullWidth
            label="Marks Obtained"
            type="number"
            value={gradeData.marks_obtained}
            onChange={(e) =>
              setGradeData({ ...gradeData, marks_obtained: e.target.value })
            }
            sx={{ mt: 3, mb: 2 }}
            inputProps={{ max: selectedSubmission?.max_marks, min: 0 }}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleGradeSubmit} variant="contained" sx={{ bgcolor: BLUE, color: "#fff", borderRadius: 2 }}>
            Submit Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GradeSubmissions;
