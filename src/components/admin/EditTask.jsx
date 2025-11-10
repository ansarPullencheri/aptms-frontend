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
  Alert,
  MenuItem,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';

const EditTask = () => {
  const { id } = useParams(); // Get task ID from URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_marks: 100,
    week_number: 1,
  });
  
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  useEffect(() => {
    fetchTask();
    fetchCourses();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/tasks/${id}/`);
      const task = response.data;
      
      // Format date for datetime-local input
      const formattedDate = task.due_date ? 
        new Date(task.due_date).toISOString().slice(0, 16) : '';
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: formattedDate,
        max_marks: task.max_marks || 100,
        week_number: task.week_number || 1,
      });
      
      setSelectedCourse(task.course?.id || task.course_id || '');
      setSelectedBatch(task.batch?.id || task.batch_id || '');
      
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load task details' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchBatches = async (courseId) => {
    try {
      const response = await API.get(`/courses/${courseId}/batches/`);
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchBatches(selectedCourse);
    }
  }, [selectedCourse]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.due_date || !selectedCourse) {
      setMessage({ 
        type: 'error', 
        text: 'Please fill in all required fields' 
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        max_marks: formData.max_marks,
        week_number: formData.week_number,
        course_id: selectedCourse,
        batch_id: selectedBatch || null,
      };
      
      await API.put(`/tasks/${id}/update/`, updateData);
      
      setMessage({ 
        type: 'success', 
        text: 'Task updated successfully!' 
      });
      
      setTimeout(() => {
        navigate('/admin/manage-tasks');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating task:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update task' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/manage-tasks')}
            sx={{ color: '#1976d2' }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
            Edit Task
          </Typography>
        </Box>

        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            select
            label="Course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
            sx={{ mb: 3 }}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Batch (Optional - leave empty for course-wide)"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            sx={{ mb: 3 }}
            disabled={!selectedCourse}
          >
            <MenuItem value="">All Batches (Course-wide)</MenuItem>
            {batches.map((batch) => (
              <MenuItem key={batch.id} value={batch.id}>
                {batch.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Week Number"
            name="week_number"
            type="number"
            value={formData.week_number}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Due Date"
            name="due_date"
            type="datetime-local"
            value={formData.due_date}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Maximum Marks"
            name="max_marks"
            type="number"
            value={formData.max_marks}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/manage-tasks')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={submitting}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              {submitting ? 'Updating...' : 'Update Task'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditTask;
