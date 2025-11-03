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
} from '@mui/material';
import {
  ArrowBack,
  Save,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";
const YELLOW = "#fbbc04";

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
        
        let studentsList = Array.isArray(response.data) 
          ? response.data 
          : response.data.students || [];
        
        setStudents(studentsList);
        const batch = batches.find(b => b.id === parseInt(batchId));
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
      const student = students.find(s => s.id === parseInt(studentId));
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
      
      // ✅ Auto-navigate to View Progress after 1.5 seconds
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
    const currentIndex = students.findIndex(s => s.id === parseInt(selectedStudent));
    if (currentIndex < students.length - 1) {
      setSelectedStudent(students[currentIndex + 1].id.toString());
    }
  };

  const handlePreviousStudent = () => {
    const currentIndex = students.findIndex(s => s.id === parseInt(selectedStudent));
    if (currentIndex > 0) {
      setSelectedStudent(students[currentIndex - 1].id.toString());
    }
  };

  const currentIndex = selectedStudent 
    ? students.findIndex(s => s.id === parseInt(selectedStudent)) + 1 
    : 0;

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
        <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700 }}>
          📊 Weekly Progress Review
        </Typography>
        <Typography variant="body1" color="#223a5e">
          Select batch, student, and week to add feedback
        </Typography>
      </Paper>

      {message.text && (
        <Alert
          severity={message.type || 'info'}
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: LIGHT_BLUE, border: `1px solid ${BLUE}` }}>
        <Typography variant="h6" sx={{ mb: 2, color: BLUE, fontWeight: 700 }}>
          📋 Select Details
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Select Batch</InputLabel>
              <Select
                value={selectedBatch}
                label="Select Batch"
                onChange={handleBatchChange}
                sx={{ borderRadius: 2, bgcolor: '#fff' }}
              >
                <MenuItem value="">-- Choose Batch --</MenuItem>
                {batches.map(batch => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!selectedBatch || loadingStudents}>
              <InputLabel>Select Student</InputLabel>
              <Select
                value={selectedStudent}
                label="Select Student"
                onChange={handleStudentChange}
                sx={{ borderRadius: 2, bgcolor: '#fff' }}
              >
                <MenuItem value="">-- Choose Student --</MenuItem>
                {students.map(student => (
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
                py: 1,
                '&:hover': { bgcolor: "#003c8f" },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {saving ? 'Saving...' : '✅ Save'}
            </Button>
          </Grid>
        </Grid>

        {selectedStudent && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
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
              sx={{ borderRadius: 2 }}
            >
              Previous
            </Button>
            <Button
              size="small"
              endIcon={<NavigateNext />}
              onClick={handleNextStudent}
              disabled={currentIndex === students.length}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>

      {selectedStudent && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${LIGHT_BLUE}`, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700, mb: 2 }}>
                  👤 Student Info
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="#666">Name</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedStudentData?.name || selectedStudentData?.username}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="#666">Email</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedStudentData?.email || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="#666">Batch</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedBatchData?.name}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ p: 1.5, bgcolor: LIGHT_BLUE, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="#666">Week</Typography>
                  <Typography variant="h5" sx={{ color: BLUE, fontWeight: 700 }}>
                    {weekNumber}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3, borderRadius: 2, border: `2px solid ${YELLOW}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ color: YELLOW, fontWeight: 700 }}>
                    Feedback
                  </Typography>
                  
                </Box>
                <Typography variant="caption" color="#666" sx={{ mb: 1, display: 'block' }}>
                  Add the feedback
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Add internal observations, areas to improve, etc..."
                  value={feedback.mentor_feedback}
                  onChange={(e) => setFeedback({ ...feedback, mentor_feedback: e.target.value })}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    bgcolor: '#fff'
                  }}
                />
              </CardContent>
            </Card>

            <Card sx={{ mb: 3, borderRadius: 2, border: `2px solid ${GREEN}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ color: GREEN, fontWeight: 700 }}>
                    💬 Notes
                  </Typography>
                 
                </Box>
                <Typography variant="caption" color="#666" sx={{ mb: 1, display: 'block' }}>
                  Add the notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Positive feedback, encouragement, praise for good work..."
                  value={feedback.student_feedback}
                  onChange={(e) => setFeedback({ ...feedback, student_feedback: e.target.value })}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    bgcolor: '#fff'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {!selectedStudent && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color={BLUE} sx={{ mb: 2 }}>
            👆 Select a student to add feedback
          </Typography>
          <Typography color="#666">
            Choose batch → student → week to get started
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default WeeklyProgressReview;
