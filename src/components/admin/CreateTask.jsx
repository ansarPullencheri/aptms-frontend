import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  OutlinedInput,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Switch,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Assignment,
  Task,
  PersonAdd,
  Menu as MenuIcon,
  Close,
  School,
} from '@mui/icons-material';

const BLUE = '#1976d2';
const LIGHT_GREY = '#f5f7fa';

const CreateTask = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [assignToAll, setAssignToAll] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    batch_id: '',
    task_type: 'batch',
    assigned_to_ids: [],
    due_date: '',
    max_marks: 100,
    task_order: 0,
    week_number: 1,
    is_scheduled: false,
    release_date: '',
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage Users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    { id: 'approvals', label: 'Approvals', icon: PersonAdd, path: '/admin/student-approval' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.course_id) fetchBatches(formData.course_id);
  }, [formData.course_id]);

  useEffect(() => {
    if (formData.batch_id && formData.task_type === 'batch') fetchBatchStudents(formData.batch_id);
  }, [formData.batch_id, formData.task_type]);

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/');
      setCourses(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch courses' });
    }
  };

  const fetchBatches = async (courseId) => {
    try {
      const response = await API.get('/courses/batches/');
      const courseBatches = response.data.filter((b) => b.course.id === parseInt(courseId));
      setBatches(courseBatches);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch batches' });
    }
  };

  const fetchBatchStudents = async (batchId) => {
    try {
      const response = await API.get(`/courses/batches/${batchId}/students/`);
      setStudents(response.data.students || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch students' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        batch_id: formData.task_type === 'course' ? null : formData.batch_id,
        assigned_to_ids: formData.task_type === 'course' ? [] : assignToAll ? [] : formData.assigned_to_ids,
        release_date: formData.is_scheduled ? formData.release_date : null,
      };
      const response = await API.post('/tasks/create/', submitData);
      setMessage({ type: 'success', text: response.data.message || 'Task created successfully!' });

      setFormData({
        title: '',
        description: '',
        course_id: '',
        batch_id: '',
        task_type: 'batch',
        assigned_to_ids: [],
        due_date: '',
        max_marks: 100,
        task_order: 0,
        week_number: 1,
        is_scheduled: false,
        release_date: '',
      });
      setAssignToAll(true);
      setBatches([]);
      setStudents([]);

      setTimeout(() => navigate('/admin/manage-tasks'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error creating task' });
    } finally {
      setLoading(false);
    }
  };

  const Sidebar = () => (
    <Box
      sx={{
        width: sidebarOpen ? 220 : 70,
        height: '100vh',
        bgcolor: '#fff',
        borderRight: '1px solid #e0e0e0',
        transition: 'width 0.25s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', p: 2 }}>
        {sidebarOpen && (
          <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700 }}>
            Admin
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
          const isActive = activeNav === item.id;
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
                backgroundColor: isActive ? BLUE : 'transparent',
                '&:hover': { backgroundColor: isActive ? BLUE : LIGHT_GREY },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#fff' : BLUE }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : '#333' }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin 0.25s ease' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Create New Task
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Task Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Task Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Task Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Marks"
                    type="number"
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 1, max: 1000 }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>

                {/* Course & Batch */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Course & Batch
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required sx={{ minWidth: 140 }}>
                    <InputLabel >Course</InputLabel>
                    <Select
                      value={formData.course_id}
                      onChange={(e) =>
                        setFormData({ ...formData, course_id: e.target.value, batch_id: '', assigned_to_ids: [] })
                      }
                    >
                      {courses.length === 0 ? (
                        <MenuItem disabled>No courses available</MenuItem>
                      ) : (
                        courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  {formData.task_type === 'batch' && (
                    <FormControl fullWidth required disabled={!formData.course_id} sx={{ minWidth: 140 }}>
                      <InputLabel>Batch</InputLabel>
                      <Select
                        value={formData.batch_id}
                        onChange={(e) => setFormData({ ...formData, batch_id: e.target.value, assigned_to_ids: [] })}
                      >
                        {batches.length === 0 ? (
                          <MenuItem disabled>No batches available</MenuItem>
                        ) : (
                          batches.map((batch) => <MenuItem key={batch.id} value={batch.id}>{batch.name}</MenuItem>)
                        )}
                      </Select>
                    </FormControl>
                  )}
                </Grid>

                {/* Task Type */}
                <Grid item xs={12}>
                  <FormControl>
                    <FormLabel sx={{ fontWeight: 600 }}>Task Type</FormLabel>
                    <RadioGroup
                      row
                      value={formData.task_type}
                      onChange={(e) =>
                        setFormData({ ...formData, task_type: e.target.value, batch_id: '', assigned_to_ids: [] })
                      }
                    >
                      <FormControlLabel value="batch" control={<Radio sx={{ color: BLUE }} />} label="Batch Specific" />
                      <FormControlLabel value="course" control={<Radio sx={{ color: BLUE }} />} label="Course Wide" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* Assign Students */}
                {formData.task_type === 'batch' && (
                  <>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={assignToAll}
                            onChange={(e) => {
                              setAssignToAll(e.target.checked);
                              if (e.target.checked) setFormData({ ...formData, assigned_to_ids: [] });
                            }}
                          />
                        }
                        label="Assign to all students in the batch"
                      />
                    </Grid>
                    {!assignToAll && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Select Students</InputLabel>
                          <Select
                            multiple
                            value={formData.assigned_to_ids}
                            onChange={(e) => setFormData({ ...formData, assigned_to_ids: e.target.value })}
                            input={<OutlinedInput label="Select Students" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                  const student = students.find((s) => s.id === value);
                                  return <Chip key={value} label={`${student?.first_name}`} size="small" />;
                                })}
                              </Box>
                            )}
                          >
                            {students.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.first_name} {s.last_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </>
                )}

                {/* Schedule & Dates */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_scheduled}
                        onChange={(e) => setFormData({ ...formData, is_scheduled: e.target.checked })}
                      />
                    }
                    label="Schedule Release Date"
                  />
                </Grid>
                {formData.is_scheduled && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Release Date & Time"
                      value={formData.release_date}
                      onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Due Date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Week Number"
                    value={formData.week_number}
                    onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Task Order"
                    value={formData.task_order}
                    onChange={(e) => setFormData({ ...formData, task_order: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate('/admin/manage-tasks')} disabled={loading}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Task'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default CreateTask;
