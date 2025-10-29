import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Box, Button, TextField, CircularProgress, Alert, Chip, Divider,
  Card, CardContent, Grid, Avatar, List, ListItemButton, ListItemIcon, ListItemText, IconButton,
} from '@mui/material';
import {
  ArrowBack, Assignment, CalendarToday, Grade, Person, School, CloudUpload, CheckCircle,
  Description, AttachFile, Download, Feedback as FeedbackIcon, Menu as MenuIcon, Close,
  Dashboard as DashboardIcon, PendingActions,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const TaskSubmission = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('tasks');
  const [submissionData, setSubmissionData] = useState({
    submission_text: '',
    submission_file: null,
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: Assignment, path: '/student/tasks' },
    { id: 'submissions', label: 'Submissions', icon: CheckCircle, path: '/student/submissions' },
  ];

  useEffect(() => { fetchTaskDetails(); }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await API.get(`/auth/student/tasks/${taskId}/`);
      setTask(response.data);
    } catch {
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => setSubmissionData({ ...submissionData, submission_file: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('task_id', taskId);
      formData.append('submission_text', submissionData.submission_text);
      if (submissionData.submission_file) {
        formData.append('submission_file', submissionData.submission_file);
      }
      await API.post('/auth/student/tasks/submit/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Task submitted successfully!');
      setTimeout(() => { navigate('/student/tasks'); }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = () => {
    if (!task) return false;
    return new Date(task.due_date) < new Date();
  };

  // ✅ Simplified Sidebar - matching all other pages
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
      p: 0,
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
        <Sidebar />
        <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: BLUE }} />
        </Box>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
        <Sidebar />
        <Container maxWidth="lg" sx={{ py: 4, ml: sidebarOpen ? '220px' : '70px' }}>
          <Alert severity="error">Task not found</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/student/tasks')}
            sx={{
              mb: 3, borderRadius: 2,
              color: BLUE, bgcolor: "#fff", borderColor: LIGHT_BLUE,
              '&:hover': { bgcolor: LIGHT_BLUE }
            }}
          >
            Back to Tasks
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>
          )}

          <Grid container spacing={3}>
            {/* Task Details */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}` }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE }}>
                      {task.title}
                    </Typography>
                    {task.is_submitted ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Submitted"
                        sx={{
                          bgcolor: "#009688", color: "#fff", fontWeight: 700,
                        }}
                      />
                    ) : isOverdue() ? (
                      <Chip
                        label="Overdue"
                        sx={{
                          bgcolor: "#D84315", color: "#fff", fontWeight: 700,
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<PendingActions />}
                        label="Pending"
                        sx={{
                          bgcolor: "#fbbc04", color: "#222", fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      icon={<School />}
                      label={task.course.name}
                      variant="outlined"
                      sx={{ color: BLUE, borderColor: LIGHT_BLUE }}
                    />
                    {task.batch && (
                      <Chip
                        label={task.batch.name}
                        variant="outlined"
                        sx={{ color: BLUE, borderColor: LIGHT_BLUE }}
                      />
                    )}
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: BLUE, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description /> Task Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: "#223a5e" }}>
                    {task.description}
                  </Typography>
                </Box>

                {/* Submission Form */}
                {!task.is_submitted ? (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: BLUE, mb: 2 }}>
                      Submit Your Work
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Submission Text (Optional)"
                      value={submissionData.submission_text}
                      onChange={(e) => setSubmissionData({ ...submissionData, submission_text: e.target.value })}
                      placeholder="Write your submission here or paste a link..."
                      sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Box sx={{ mb: 3 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFile />}
                        sx={{ mb: 1, color: BLUE, borderColor: LIGHT_BLUE, bgcolor: "#fff", '&:hover': { bgcolor: LIGHT_BLUE } }}
                      >
                        Attach File (Optional)
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                        />
                      </Button>
                      {submissionData.submission_file && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Selected: {submissionData.submission_file.name}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={submitting || (!submissionData.submission_text && !submissionData.submission_file)}
                      startIcon={submitting ? <CircularProgress size={20} /> : <CloudUpload />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: BLUE,
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: "#fff",
                        '&:hover': { bgcolor: "#003c8f" },
                        transition: 'all 0.3s',
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Task'}
                    </Button>
                  </Box>
                ) : (
                  /* Show Submission Details */
                  <Card sx={{ bgcolor: LIGHT_BLUE, border: `1.5px solid ${BLUE}` }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: BLUE, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: "#009688" }} /> Your Submission
                      </Typography>
                      <Typography variant="body2" color="#223a5e" sx={{ mb: 1 }}>
                        Submitted on: {new Date(task.submission.submitted_at).toLocaleString()}
                      </Typography>
                      {task.submission.submission_text && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: BLUE }}>
                            Submission Text:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff', color: "#223a5e" }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {task.submission.submission_text}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                      {task.submission.submission_file && (
                        <Box sx={{ mb: 2 }}>
                          <Button
                            size="small"
                            startIcon={<Download />}
                            href={task.submission.submission_file}
                            target="_blank"
                            variant="outlined"
                            sx={{ color: BLUE, borderColor: BLUE, bgcolor: "#fff" }}
                          >
                            Download Submitted File
                          </Button>
                        </Box>
                      )}
                      {task.submission.marks_obtained !== null && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: BLUE }}>
                            Grade:
                          </Typography>
                          <Chip
                            icon={<Grade />}
                            label={`${task.submission.marks_obtained} / ${task.max_marks}`}
                            sx={{
                              bgcolor: "#009688", color: "#fff", fontWeight: 700,
                            }}
                          />
                        </Box>
                      )}
                      {task.submission.feedback && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: BLUE, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FeedbackIcon fontSize="small" /> Feedback:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff', color: "#223a5e" }}>
                            <Typography variant="body2">
                              {task.submission.feedback}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Paper>
            </Grid>

            {/* Task Info Sidebar */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20, border: `1.5px solid ${LIGHT_BLUE}`, bgcolor: "#fff" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: BLUE, mb: 3 }}>
                  Task Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="#223a5e" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 14 }} /> Due Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: BLUE }}>
                      {new Date(task.due_date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="#223a5e" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Grade sx={{ fontSize: 14 }} /> Maximum Marks
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: BLUE }}>
                      {task.max_marks}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="#223a5e" sx={{ mb: 0.5 }}>
                      Assigned By
                    </Typography>
                    <Chip
                      avatar={<Avatar sx={{ bgcolor: BLUE, color: "#fff" }}>{task.created_by.name[0]}</Avatar>}
                      label={task.created_by.name}
                      size="small"
                      sx={{ mt: 0.5, color: BLUE, borderColor: BLUE, borderWidth: 1 }}
                    />
                    <Typography variant="caption" display="block" color="#223a5e" sx={{ mt: 0.5 }}>
                      {task.created_by.role}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default TaskSubmission;
