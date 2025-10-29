import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, TextField, Button, Grid, FormControl, InputLabel, Select,
  MenuItem, Chip, Box, Alert, OutlinedInput, Checkbox, FormControlLabel, Avatar, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Switch,
} from '@mui/material';
import { Add, ArrowBack, School, Dashboard as DashboardIcon, People, Assignment, GradeOutlined,
  Menu as MenuIcon, Close, CalendarToday, Grade,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const MentorCreateTask = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [assignToAll, setAssignToAll] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('create-task');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batch_id: '',
    assigned_to_ids: [],
    due_date: '',
    max_marks: 100,
    task_order: 0,
    week_number: 1,
    is_scheduled: false,
    release_date: '',
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/mentor/dashboard' },
    { id: 'batches', label: 'My Batches', icon: People, path: '/mentor/batches' },
    { id: 'create-task', label: 'Create Task', icon: Add, path: '/mentor/create-task' },
    { id: 'tasks', label: 'Tasks', icon: Assignment, path: '/mentor/tasks' },
  ];

  useEffect(() => { fetchMentorBatches(); }, []);
  useEffect(() => { if (formData.batch_id) fetchBatchStudents(formData.batch_id); }, [formData.batch_id]);

  const fetchMentorBatches = async () => {
    try {
      const response = await API.get('/courses/mentor/batches/');
      setBatches(response.data);
      const uniqueCourses = [...new Map(
        response.data.map(batch => [batch.course.id, batch.course])
      ).values()];
      setCourses(uniqueCourses);
    } catch (error) { setMessage({ type: 'error', text: 'Failed to fetch your batches' }); }
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
        assigned_to_ids: assignToAll ? [] : formData.assigned_to_ids,
        release_date: formData.is_scheduled ? formData.release_date : null,
      };
      const response = await API.post('/tasks/mentor/create/', submitData);
      setMessage({ type: 'success', text: response.data.message || 'Task created successfully!' });
      setFormData({
        title: '', description: '', batch_id: '', assigned_to_ids: [], due_date: '',
        max_marks: 100, task_order: 0, week_number: 1, is_scheduled: false, release_date: '',
      });
      setAssignToAll(true); setStudents([]);
      setTimeout(() => { navigate('/mentor/tasks'); }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error creating task' });
    }
  };

  // ✅ Simplified Sidebar - matching admin pages exactly
  const Sidebar = () => (
    <Box sx={{
      width: sidebarOpen ? 220 : 70,
      height: 'calc(100vh - 64px)',
      bgcolor: "#fff",
      color: '#333',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 64,
      zIndex: 1000,
      borderRight: `2px solid ${LIGHT_BLUE}`,
      boxShadow: '2px 0 16px rgba(21,101,192,0.12)',
      transition: 'width 0.18s',
      p: 0
    }}>
      {/* Toggle Button */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'flex-end' : 'center',
      }}>
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: BLUE }}>
          {sidebarOpen ? <Close /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: LIGHT_BLUE, mx: 2 }} />

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <ListItemButton
              key={item.id}
              onClick={() => { setActiveNav(item.id); navigate(item.path); }}
              sx={{
                borderRadius: 1.5,
                color: isActive ? "#fff" : BLUE,
                background: isActive ? BLUE : 'transparent',
                mb: 0.5,
                '&:hover': { background: LIGHT_BLUE },
                px: 2,
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: isActive ? "#fff" : BLUE, minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#fff' : BLUE
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  const selectedBatch = batches.find(b => b.id === formData.batch_id);

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/mentor/batches')}
            sx={{
              mb: 3, borderRadius: 2,
              color: BLUE, borderColor: LIGHT_BLUE, bgcolor: "#fff",
              '&:hover': { bgcolor: LIGHT_BLUE }
            }}
          >
            Back to Batches
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: 3, mb: 4, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${BLUE}`, color: BLUE
            }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: BLUE, color: "#fff" }}>
                <Add sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  Create New Task
                </Typography>
                <Typography variant="body2" color="#223a5e">
                  Assign tasks to students in your batches with weekly scheduling
                </Typography>
              </Box>
            </Box>
          </Paper>

          {message.text && (
            <Alert
              severity={message.type}
              sx={{
                mb: 3,
                borderRadius: 2,
                color: message.type === 'error' ? "#d32f2f" : BLUE,
              }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 4, borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}`,
            }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Task Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Batch</InputLabel>
                    <Select
                      value={formData.batch_id}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          batch_id: e.target.value,
                          assigned_to_ids: [],
                        });
                      }}
                      label="Select Batch"
                      sx={{ borderRadius: 2 }}
                    >
                      {batches.length === 0 ? (
                        <MenuItem disabled>No batches available</MenuItem>
                      ) : (
                        batches.map((batch) => (
                          <MenuItem key={batch.id} value={batch.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <People sx={{ fontSize: 20, color: BLUE }} />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {batch.name}
                                </Typography>
                                <Typography variant="caption" color="#223a5e">
                                  {batch.course.name} • {batch.student_count || 0} students
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ bgcolor: LIGHT_BLUE, borderRadius: 2, p: 2, mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={assignToAll}
                          onChange={(e) => {
                            setAssignToAll(e.target.checked);
                            if (e.target.checked)
                              setFormData({ ...formData, assigned_to_ids: [] });
                          }}
                          disabled={!formData.batch_id}
                          sx={{ color: BLUE }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: BLUE }}>
                            Assign to all students in the batch
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>

                {!assignToAll && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required disabled={!formData.batch_id}>
                      <InputLabel>Select Specific Students</InputLabel>
                      <Select
                        multiple
                        value={formData.assigned_to_ids}
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
                                  sx={{
                                    bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 700,
                                  }}
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {students.filter(s => s.is_approved).map(student => (
                          <MenuItem key={student.id} value={student.id}>
                            <Checkbox checked={formData.assigned_to_ids.indexOf(student.id) > -1} sx={{ color: BLUE }} />
                            <Avatar sx={{
                              width: 32, height: 32,
                              bgcolor: BLUE, color: "#fff",
                              fontSize: '0.75rem', fontWeight: 700, mr: 1.5
                            }}>
                              {student.first_name?.[0]}{student.last_name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ color: BLUE }}>
                                {student.first_name} {student.last_name}
                              </Typography>
                              <Typography variant="caption" color="#223a5e">
                                @{student.username}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
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
                    fullWidth
                    type="number"
                    label="Task Order"
                    value={formData.task_order}
                    onChange={e => setFormData({ ...formData, task_order: parseInt(e.target.value) || 0 })}
                    InputProps={{ inputProps: { min: 0 } }}
                    helperText="Order within the week"
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
                    label={<Typography sx={{ color: BLUE }}>Schedule Release Date</Typography>}
                  />
                  <Typography variant="caption" color="#223a5e" display="block" sx={{ ml: 4 }}>
                    {formData.is_scheduled
                      ? 'Task will be released on the scheduled date'
                      : 'Task will be immediately available'}
                  </Typography>
                </Grid>
                {formData.is_scheduled && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth type="datetime-local" label="Release Date & Time"
                      value={formData.release_date}
                      onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Due Date & Time" type="datetime-local"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Maximum Marks" type="number"
                    value={formData.max_marks}
                    onChange={e => setFormData({ ...formData, max_marks: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 1, max: 1000 }}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                {formData.title && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: BLUE }}>
                      Preview
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: LIGHT_BLUE,
                        borderRadius: 2,
                        border: `2px dashed ${BLUE}`,
                      }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE, mb: 1 }}>
                        {formData.title}
                      </Typography>
                      <Typography variant="body2" color="#223a5e" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                        {formData.description || 'No description'}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          label={`Week ${formData.week_number}`}
                          size="small"
                          sx={{ bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 700 }}
                        />
                        {formData.due_date && (
                          <Chip
                            icon={<CalendarToday sx={{ fontSize: 16 }} />}
                            label={`Due: ${new Date(formData.due_date).toLocaleString()}`}
                            size="small"
                            sx={{ bgcolor: "#D84315", color: "#fff", fontWeight: 700 }}
                          />
                        )}
                        <Chip
                          icon={<Grade sx={{ fontSize: 16 }} />}
                          label={`${formData.max_marks} Marks`}
                          size="small"
                          sx={{ bgcolor: "#0097A7", color: "#fff", fontWeight: 700 }}
                        />
                        {selectedBatch && (
                          <Chip
                            icon={<People sx={{ fontSize: 16 }} />}
                            label={selectedBatch.name}
                            size="small"
                            sx={{ bgcolor: BLUE, color: "#fff", fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: BLUE,
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: "#fff",
                      '&:hover': { bgcolor: "#003c8f", transform: 'scale(1.01)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    Submit
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

export default MentorCreateTask;
