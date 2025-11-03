import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Download,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";
const YELLOW = "#fbbc04";

const MentorReview = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    marks_obtained: '',
    feedback: '',
    internal_notes: '',
  });

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      console.log(`📍 Fetching review for submission ${submissionId}`);
      
      const response = await API.get(`/tasks/mentor/submissions/${submissionId}/`);
      
      console.log('✅ Review data loaded:', response.data);
      
      setSubmission(response.data);
      
      // Pre-fill form if already graded
      if (response.data.marks_obtained !== null) {
        setFormData({
          marks_obtained: response.data.marks_obtained.toString(),
          feedback: response.data.feedback,
          internal_notes: response.data.internal_notes,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching review:', error);
      setMessage({
        type: 'error',
        text: `Failed to load review: ${error.response?.data?.error || error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveReview = async () => {
    try {
      setSaving(true);
      
      if (!formData.marks_obtained) {
        setMessage({
          type: 'error',
          text: 'Please enter marks obtained',
        });
        return;
      }
      
      const marks = parseFloat(formData.marks_obtained);
      if (marks > submission.task.max_marks) {
        setMessage({
          type: 'error',
          text: `Marks cannot exceed ${submission.task.max_marks}`,
        });
        return;
      }
      
      console.log('📤 Saving review:', formData);
      
      const response = await API.post(
        `/tasks/mentor/submissions/${submissionId}/grade/`,
        formData
      );
      
      console.log('✅ Review saved:', response.data);
      
      setMessage({
        type: 'success',
        text: 'Review saved successfully!',
      });
      
      // Refresh data
      fetchSubmission();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error saving review:', error);
      setMessage({
        type: 'error',
        text: `Error saving review: ${error.response?.data?.error || error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadFile = () => {
    if (submission?.submission_file) {
      window.open(submission.submission_file, '_blank');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: BLUE }} />
      </Box>
    );
  }

  if (!submission) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">Submission not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
          📋 Review Submission
        </Typography>
        <Typography variant="body1" color="#223a5e">
          <strong>Student:</strong> {submission.student.name} | 
          <strong style={{ marginLeft: '20px' }}>Course:</strong> {submission.task.course.name} | 
          <strong style={{ marginLeft: '20px' }}>Batch:</strong> {submission.task.batch?.name || 'N/A'} | 
          <strong style={{ marginLeft: '20px' }}>Week:</strong> Week info not available
        </Typography>
      </Paper>

      {/* Messages */}
      {message.text && (
        <Alert
          severity={message.type || 'info'}
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Submission Details */}
        <Grid item xs={12} md={6}>
          {/* Student Info */}
          <Card sx={{ mb: 3, borderRadius: 2, border: `1px solid ${LIGHT_BLUE}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
                👤 Student Information
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="#223a5e">Name</Typography>
                <Typography variant="body2" fontWeight={600}>{submission.student.name}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="#223a5e">Email</Typography>
                <Typography variant="body2" fontWeight={600}>{submission.student.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="#223a5e">Username</Typography>
                <Typography variant="body2" fontWeight={600}>{submission.student.username}</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Task Info */}
          <Card sx={{ mb: 3, borderRadius: 2, border: `1px solid ${LIGHT_BLUE}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
                📝 Task Information
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="#223a5e">Task Title</Typography>
                <Typography variant="body2" fontWeight={600}>{submission.task.title}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="#223a5e">Max Marks</Typography>
                <Chip label={submission.task.max_marks} size="small" sx={{ bgcolor: GREEN, color: '#fff' }} />
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="#223a5e">Due Date</Typography>
                <Typography variant="body2">{new Date(submission.task.due_date).toLocaleDateString()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="#223a5e">Description</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                  {submission.task.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card sx={{ borderRadius: 2, border: `1px solid ${LIGHT_BLUE}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
                📤 Submission Content
              </Typography>
              
              {submission.submission_text && (
                <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="#223a5e" fontWeight={700}>
                    📝 Submission Text
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    {submission.submission_text}
                  </Typography>
                </Box>
              )}

              {submission.submission_file && (
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
                    '&:hover': { bgcolor: LIGHT_BLUE }
                  }}
                >
                  Download Submission File
                </Button>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ p: 2, bgcolor: LIGHT_BLUE, borderRadius: 1 }}>
                <Typography variant="caption" color="#223a5e">Submitted At</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(submission.submitted_at).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Review & Feedback */}
        <Grid item xs={12} md={6}>
          {/* Marks Section */}
          <Card sx={{ mb: 3, borderRadius: 2, border: `2px solid ${GREEN}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: GREEN, fontWeight: 700, mb: 2 }}>
                ⭐ Grading
              </Typography>
              <TextField
                fullWidth
                label="Marks Obtained"
                type="number"
                name="marks_obtained"
                value={formData.marks_obtained}
                onChange={handleInputChange}
                placeholder="Enter marks"
                inputProps={{
                  min: 0,
                  max: submission.task.max_marks,
                  step: 0.5
                }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box sx={{ p: 2, bgcolor: LIGHT_BLUE, borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="#223a5e">
                  Out of <strong>{submission.task.max_marks}</strong> marks
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Feedback (Student Visible) */}
          <Card sx={{ mb: 3, borderRadius: 2, border: `2px solid ${BLUE}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700 }}>
                  💬 Feedback
                </Typography>
                <Chip label="Student Visible" size="small" sx={{ bgcolor: BLUE, color: '#fff' }} />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Feedback for Student"
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                placeholder="This feedback will be visible to the student..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Typography variant="caption" color="#666" sx={{ mt: 1, display: 'block' }}>
                ℹ️ Students will receive this feedback in their submission history.
              </Typography>
            </CardContent>
          </Card>

          {/* Internal Notes (Mentor/Admin Only) */}
          <Card sx={{ mb: 3, borderRadius: 2, border: `2px solid ${YELLOW}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ color: YELLOW, fontWeight: 700 }}>
                  🔒 Internal Notes
                </Typography>
                <Chip label="Mentor/Admin Only" size="small" sx={{ bgcolor: YELLOW, color: '#222' }} />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Internal Notes"
                name="internal_notes"
                value={formData.internal_notes}
                onChange={handleInputChange}
                placeholder="Only visible to mentors and admins..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Typography variant="caption" color="#666" sx={{ mt: 1, display: 'block' }}>
                ℹ️ These notes are private and will NOT be visible to students.
              </Typography>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveReview}
            disabled={saving || !formData.marks_obtained}
            sx={{
              bgcolor: GREEN,
              color: '#fff',
              borderRadius: 2,
              fontWeight: 700,
              py: 1.5,
              '&:hover': { bgcolor: '#005a4d' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {saving ? 'Saving...' : 'Save Review'}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MentorReview;
