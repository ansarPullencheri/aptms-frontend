import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, Chip, Box, Alert, OutlinedInput, Checkbox,
  FormControlLabel, Radio, RadioGroup, FormLabel, Switch, Divider,
  Avatar, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Badge
} from '@mui/material';
import { Schedule as ScheduleIcon, Assignment as AssignmentIcon,
  Dashboard as DashboardIcon, People, Assignment, Task, PersonAdd, Menu as MenuIcon, Close, School
} from '@mui/icons-material';

const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';

const CreateTask = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [assignToAll, setAssignToAll] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('tasks');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', course_id: '', batch_id: '', task_type: 'batch',
    assigned_to_ids: [], due_date: '', max_marks: 100, task_order: 0,
    week_number: 1, is_scheduled: false, release_date: '',
  });

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (formData.course_id) fetchBatches(formData.course_id); }, [formData.course_id]);
  useEffect(() => { if (formData.batch_id && formData.task_type === 'batch') fetchBatchStudents(formData.batch_id); }, [formData.batch_id, formData.task_type]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    { id: 'approvals', label: 'Approvals', icon: PersonAdd, path: '/admin/student-approval' },
  ];

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/');
      setCourses(response.data);
    } catch (error) { setMessage({ type: 'error', text: 'Failed to fetch courses' }); }
  };
  const fetchBatches = async (courseId) => {
    try {
      const response = await API.get('/courses/batches/');
      const courseBatches = response.data.filter((b) => b.course.id === parseInt(courseId));
      setBatches(courseBatches);
    } catch (error) { setMessage({ type: 'error', text: 'Failed to fetch batches' }); }
  };
  const fetchBatchStudents = async (batchId) => {
    try {
      const response = await API.get(`/courses/batches/${batchId}/students/`);
      setStudents(response.data.students || []);
    } catch (error) { setMessage({ type: 'error', text: 'Failed to fetch students' }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const submitData = {
        ...formData,
        batch_id: formData.task_type === 'course' ? null : formData.batch_id,
        assigned_to_ids: formData.task_type === 'course' ? [] : (assignToAll ? [] : formData.assigned_to_ids),
        release_date: formData.is_scheduled ? formData.release_date : null,
      };
      const response = await API.post('/tasks/create/', submitData);
      setMessage({ type: 'success', text: response.data.message || 'Task created successfully!' });
      setFormData({
        title: '', description: '', course_id: '', batch_id: '', task_type: 'batch', assigned_to_ids: [],
        due_date: '', max_marks: 100, task_order: 0, week_number: 1, is_scheduled: false, release_date: '',
      });
      setAssignToAll(true); setBatches([]); setStudents([]);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error creating task' });
    }
  };

  // Sidebar Blue & White
  const Sidebar = () => (
    <Box sx={{
      width: sidebarOpen ? 220 : 70, height: '100vh', bgcolor: '#fff', color: BLUE,
      display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 1200,
      borderRight: `2px solid ${LIGHT_BLUE}`, boxShadow: '2px 0 16px rgba(21,101,192,0.08)', p: 0,
      transition: 'width 0.2s',
    }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {sidebarOpen &&
          <img src="https://www.tefora.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftefora-logo.b0f56c66.webp&w=384&q=75"
            alt="Tefora Logo"
            style={{ width: 120, height: 30, borderRadius: '6px' }} />}
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: BLUE }}>
          {sidebarOpen ? <Close /> : <MenuIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: LIGHT_BLUE, mx: 2 }} />
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon; const isActive = activeNav === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { setActiveNav(item.id); navigate(item.path); }}
                sx={{
                  borderRadius: 2, color: isActive ? '#fff' : BLUE,
                  background: isActive ? BLUE : 'transparent',
                  '&:hover': { background: LIGHT_BLUE },
                  px: 2, py: 1.5,
                }}>
                <ListItemIcon sx={{ color: isActive ? '#fff' : BLUE }}>
                  <Icon />
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 400, color: isActive ? '#fff' : BLUE }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: LIGHT_BLUE, mx: 2 }} />
      <Box sx={{
        p: 2, display: 'flex', alignItems: 'center', gap: 2,
        bgcolor: LIGHT_BLUE, borderTopLeftRadius: 10, borderTopRightRadius: 10
      }}>
        <Avatar sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>A</Avatar>
        {sidebarOpen &&
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: BLUE }}>Admin User</Typography>
            <Typography variant="caption" sx={{ color: '#333' }}>admin@edu.com</Typography>
          </Box>}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#fff', border: `1.5px solid ${BLUE}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <AssignmentIcon sx={{ fontSize: 40, color: BLUE, bgcolor: LIGHT_BLUE, px: 1, py: 0.5, borderRadius: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  Create New Task
                </Typography>
                <Typography variant="body2" color="#223a5e">
                  Create and assign tasks to students with weekly scheduling
                </Typography>
              </Box>
            </Box>
            {message.text && (
              <Alert
                severity={message.type}
                sx={{ mb: 3, borderRadius: 2, color: message.type === 'error' ? "#d32f2f" : BLUE }}
                onClose={() => setMessage({ type: '', text: '' })}
              >
                {message.text}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📝 Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: LIGHT_BLUE }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Task Title" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required helperText="Enter a clear and descriptive task title"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Description" multiline rows={4} required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    helperText="Provide detailed instructions for the task"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    🎯 Assignment Settings
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: LIGHT_BLUE }} />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={formData.course_id}
                      onChange={e => {
                        setFormData({ ...formData, course_id: e.target.value, batch_id: '', assigned_to_ids: [] });
                        setBatches([]); setStudents([]);
                      }}
                      label="Course"
                      sx={{ borderRadius: 2 }}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>{course.name} ({course.code})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl>
                    <FormLabel>Task Type</FormLabel>
                    <RadioGroup row value={formData.task_type}
                      onChange={e => {
                        setFormData({
                          ...formData, task_type: e.target.value, batch_id: '', assigned_to_ids: [],
                        });
                        setStudents([]); setAssignToAll(true);
                      }}>
                      <FormControlLabel value="batch" control={<Radio sx={{ color: BLUE }} />} label="Batch Specific" />
                      <FormControlLabel value="course" control={<Radio sx={{ color: BLUE }} />} label="Course Wide (All Batches)" />
                    </RadioGroup>
                  </FormControl>
                  <Alert severity="info" sx={{ mt: 1, bgcolor: LIGHT_BLUE, color: BLUE }}>
                    {formData.task_type === 'course'
                      ? '🌐 This task will be automatically assigned to ALL students in ALL batches of the selected course'
                      : '📋 This task will be assigned only to students in the selected batch'}
                  </Alert>
                </Grid>
                {formData.task_type === 'batch' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required disabled={!formData.course_id}>
                      <InputLabel>Batch</InputLabel>
                      <Select
                        value={formData.batch_id}
                        onChange={e => setFormData({ ...formData, batch_id: e.target.value, assigned_to_ids: [] })}
                        label="Batch"
                        sx={{ borderRadius: 2 }}
                      >
                        {batches.length === 0
                          ? <MenuItem disabled>No batches available for this course</MenuItem>
                          : batches.map(batch => (
                            <MenuItem key={batch.id} value={batch.id}>{batch.name}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {formData.task_type === 'batch' && (
                  <>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={assignToAll}
                            onChange={e => {
                              setAssignToAll(e.target.checked);
                              if (e.target.checked) setFormData({ ...formData, assigned_to_ids: [] });
                            }}
                            disabled={!formData.batch_id}
                            sx={{ color: BLUE }}
                          />
                        }
                        label="Assign to all students in the batch"
                      />
                    </Grid>
                    {!assignToAll && (
                      <Grid item xs={12}>
                        <FormControl fullWidth required disabled={!formData.batch_id}>
                          <InputLabel>Select Specific Students</InputLabel>
                          <Select
                            multiple value={formData.assigned_to_ids}
                            onChange={e => setFormData({ ...formData, assigned_to_ids: e.target.value })}
                            input={<OutlinedInput label="Select Specific Students" />}
                            sx={{ borderRadius: 2 }}
                            renderValue={selected => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map(value => {
                                  const student = students.find(s => s.id === value);
                                  return (
                                    <Chip
                                      key={value}
                                      label={`${student?.first_name} ${student?.last_name}`}
                                      size="small"
                                      sx={{ bgcolor: LIGHT_BLUE, color: BLUE }}
                                    />
                                  );
                                })}
                              </Box>
                            )}
                          >
                            {students.length === 0
                              ? <MenuItem disabled>No students found in this batch</MenuItem>
                              : students.map(student => (
                                <MenuItem key={student.id} value={student.id}>
                                  {student.first_name} {student.last_name} ({student.username})
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </>
                )}
                {/* Weekly Scheduling */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <ScheduleIcon /> Weekly Scheduling
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: LIGHT_BLUE }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth type="number"
                    label="Week Number"
                    value={formData.week_number}
                    onChange={e => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })}
                    InputProps={{ inputProps: { min: 1, max: 52 } }}
                    helperText="Course week (1-52)"
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth type="number"
                    label="Task Order"
                    value={formData.task_order}
                    onChange={e => setFormData({ ...formData, task_order: parseInt(e.target.value) || 0 })}
                    InputProps={{ inputProps: { min: 0 } }}
                    helperText="Order within the week (0, 1, 2...)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_scheduled}
                        onChange={e => setFormData({ ...formData, is_scheduled: e.target.checked })}
                        sx={{ color: BLUE }}
                      />
                    }
                    label="Schedule Release Date"
                  />
                  <Typography variant="caption" color="#223a5e" display="block" sx={{ ml: 4 }}>
                    {formData.is_scheduled
                      ? 'Task will be released on the scheduled date and time'
                      : 'Task will be immediately available to students'}
                  </Typography>
                </Grid>
                {formData.is_scheduled && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth type="datetime-local"
                      label="Release Date & Time"
                      value={formData.release_date}
                      onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                      helperText="Task will become available to students from this date"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                )}
                {/* Deadlines and Marks */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    ⏰ Deadlines & Grading
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: LIGHT_BLUE }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Due Date" type="datetime-local"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required helperText="Submission deadline"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Maximum Marks" type="number"
                    value={formData.max_marks}
                    onChange={e => setFormData({ ...formData, max_marks: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 1, max: 1000 }}
                    required helperText="Total marks for this task"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ mt: 2, py: 1.5, bgcolor: BLUE, color: "#fff", borderRadius: 2, fontWeight: 700,
                      '&:hover': { bgcolor: "#003c8f" }
                    }}
                  >
                    Create Task
                  </Button>
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
