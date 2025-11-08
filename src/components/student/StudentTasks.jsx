import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Box, CircularProgress, Chip, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Button, Alert, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TablePagination,
} from '@mui/material';
import {
  Assignment, CheckCircle, PendingActions, Dashboard as DashboardIcon, Menu as MenuIcon, Close,
  CalendarToday, Grade, AccessTime, ArrowForward, Error as ErrorIcon, Visibility, Lock, Schedule as ScheduleIcon, RateReview
} from '@mui/icons-material';

const BLUE = "#1976d2";
const LIGHT_GREY = "#f5f7fa";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentTasks = () => {
  const [tabValue, setTabValue] = useState(0);
  const [allTasks, setAllTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('tasks');
  
  const [allTasksPage, setAllTasksPage] = useState(0);
  const [allTasksRowsPerPage, setAllTasksRowsPerPage] = useState(10);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(10);
  const [submissionsPage, setSubmissionsPage] = useState(0);
  const [submissionsRowsPerPage, setSubmissionsRowsPerPage] = useState(10);
  
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: Assignment, path: '/student/tasks' },
    { id: 'submissions', label: 'Submissions', icon: CheckCircle, path: '/student/submissions' },
    { id: 'feedback', label: 'My Feedback', icon: RateReview, path: '/student/progress-feedback' },
  ];

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const allTasksRes = await API.get('/auth/student/tasks/');
      setAllTasks(allTasksRes.data);
      const pendingRes = await API.get('/auth/student/tasks/pending/');
      setPendingTasks(pendingRes.data);
      const submissionsRes = await API.get('/auth/student/submissions/');
      setSubmissions(submissionsRes.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleAllTasksChangePage = (event, newPage) => setAllTasksPage(newPage);
  const handleAllTasksChangeRowsPerPage = (event) => {
    setAllTasksRowsPerPage(parseInt(event.target.value, 10));
    setAllTasksPage(0);
  };

  const handlePendingChangePage = (event, newPage) => setPendingPage(newPage);
  const handlePendingChangeRowsPerPage = (event) => {
    setPendingRowsPerPage(parseInt(event.target.value, 10));
    setPendingPage(0);
  };

  const handleSubmissionsChangePage = (event, newPage) => setSubmissionsPage(newPage);
  const handleSubmissionsChangeRowsPerPage = (event) => {
    setSubmissionsRowsPerPage(parseInt(event.target.value, 10));
    setSubmissionsPage(0);
  };

  const paginatedAllTasks = allTasks.slice(
    allTasksPage * allTasksRowsPerPage,
    allTasksPage * allTasksRowsPerPage + allTasksRowsPerPage
  );

  const paginatedPendingTasks = pendingTasks.slice(
    pendingPage * pendingRowsPerPage,
    pendingPage * pendingRowsPerPage + pendingRowsPerPage
  );

  const paginatedSubmissions = submissions.slice(
    submissionsPage * submissionsRowsPerPage,
    submissionsPage * submissionsRowsPerPage + submissionsRowsPerPage
  );

  const getStatusChip = (task) => {
    if (task.is_locked) {
      return (
        <Chip 
          label="Locked" 
          size="small" 
          icon={<Lock sx={{ fontSize: 14 }} />}
          sx={{ bgcolor: "#e0e0e0", color: "#666", fontWeight: 600 }}
        />
      );
    }
    const isSubmitted = task.is_submitted || submissions.some(sub => sub.task.id === task.id);
    if (isSubmitted) {
      return (
        <Chip 
          label="Submitted" 
          size="small"
          sx={{ bgcolor: "#4caf50", color: "#fff", fontWeight: 600 }}
        />
      );
    }
    const dueDate = new Date(task.due_date);
    const now = new Date();
    if (dueDate < now) {
      return (
        <Chip 
          label="Overdue" 
          size="small"
          sx={{ bgcolor: "#d32f2f", color: "#fff", fontWeight: 600 }}
        />
      );
    }
    return (
      <Chip 
        label="Pending" 
        size="small"
        sx={{ bgcolor: "#ff9800", color: "#fff", fontWeight: 600 }}
      />
    );
  };

  const Sidebar = () => (
    <Box
      sx={{
        width: sidebarOpen ? 220 : 70,
        height: '100vh',
        bgcolor: "#fff",
        borderRight: "1px solid #e0e0e0",
        transition: "width 0.25s ease",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 6px rgba(0,0,0,0.04)",
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          p: 2,
        }}
      >
        {sidebarOpen && (
          <Typography variant="h6" sx={{ color: BLUE, fontWeight: 700 }}>
            Student
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
          const active = activeNav === item.id;
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
                backgroundColor: active ? BLUE : "transparent",
                "&:hover": { backgroundColor: active ? BLUE : LIGHT_GREY },
              }}
            >
              <ListItemIcon sx={{ color: active ? "#fff" : BLUE }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "#333",
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: LIGHT_GREY,
        }}
      >
        <CircularProgress sx={{ color: BLUE }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? "220px" : "70px", transition: "margin 0.25s ease" }}>
        <Container maxWidth="xl" sx={{ py: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#222", mb: 4 }}>
            My Tasks 
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              bgcolor: "#fff",
            }}
          >
            <Box sx={{ borderBottom: "1px solid #e0e0e0" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  px: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: "#555",
                    minHeight: 60,
                  },
                  '& .Mui-selected': { 
                    color: BLUE + '!important',
                    fontWeight: 700,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: BLUE,
                    height: 3,
                  }
                }}
              >
                <Tab 
                  icon={<Assignment />} 
                  iconPosition="start" 
                  label={`All Tasks (${allTasks.length})`} 
                />
                <Tab 
                  icon={<PendingActions />} 
                  iconPosition="start" 
                  label={`Pending (${pendingTasks.length})`} 
                />
                <Tab 
                  icon={<CheckCircle />} 
                  iconPosition="start" 
                  label={`Submitted (${submissions.length})`} 
                />
              </Tabs>
            </Box>

            {/* All Tasks Tab */}
            <TabPanel value={tabValue} index={0}>
              {allTasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Assignment sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                  <Typography variant="h6" color="#555">
                    No Tasks Assigned
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                          {["Task Details", "Course", "Due Date", "Max Marks", "Status", "Action"].map(
                            (head) => (
                              <TableCell key={head} sx={{ fontWeight: 700, color: "#555" }}>
                                {head}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedAllTasks.map((task) => {
                          const isSubmitted = task.is_submitted || submissions.some(sub => sub.task.id === task.id);
                          const dueDate = new Date(task.due_date);
                          const now = new Date();
                          const isOverdue = dueDate < now;
                          const isLocked = task.is_locked;

                          return (
                            <TableRow key={task.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {isLocked && <Lock sx={{ fontSize: 18, color: "#d32f2f" }} />}
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {task.title}
                                    </Typography>
                                    {task.week_number && (
                                      <Typography variant="caption" color="text.secondary">
                                        Week {task.week_number}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={task.course?.name || 'N/A'}
                                  size="small"
                                  sx={{ bgcolor: LIGHT_GREY, color: BLUE, fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  color={isOverdue && !isSubmitted ? "#d32f2f" : "text.secondary"}
                                  fontWeight={isOverdue && !isSubmitted ? 600 : 400}
                                >
                                  {new Date(task.due_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {task.max_marks}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {getStatusChip(task)}
                              </TableCell>
                              <TableCell>
                                {isLocked ? (
                                  <Tooltip title={task.lock_reason || 'Complete previous task first'}>
                                    <span>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        disabled
                                        startIcon={<Lock />}
                                        sx={{ fontWeight: 600 }}
                                      >
                                        Locked
                                      </Button>
                                    </span>
                                  </Tooltip>
                                ) : isSubmitted ? (
                                  <Tooltip title="View Submission">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/student/tasks/${task.id}`)}
                                      sx={{ color: BLUE }}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate(`/student/tasks/${task.id}`)}
                                    sx={{
                                      bgcolor: isOverdue ? "#d32f2f" : BLUE,
                                      fontWeight: 600,
                                      '&:hover': { bgcolor: isOverdue ? "#b71c1c" : "#1565c0" }
                                    }}
                                  >
                                    Submit
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={allTasks.length}
                    page={allTasksPage}
                    onPageChange={handleAllTasksChangePage}
                    rowsPerPage={allTasksRowsPerPage}
                    onRowsPerPageChange={handleAllTasksChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              )}
            </TabPanel>

            {/* Pending Tasks Tab */}
            <TabPanel value={tabValue} index={1}>
              {pendingTasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CheckCircle sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                  <Typography variant="h6" color="#555">
                    No Pending Tasks
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Great job! You're all caught up
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                          {["Task Details", "Course", "Due Date", "Max Marks", "Action"].map(
                            (head) => (
                              <TableCell key={head} sx={{ fontWeight: 700, color: "#555" }}>
                                {head}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedPendingTasks.map((task) => {
                          const dueDate = new Date(task.due_date);
                          const now = new Date();
                          const isOverdue = dueDate < now;
                          const isLocked = task.is_locked;
                          
                          return (
                            <TableRow 
                              key={task.id} 
                              hover
                              sx={{ bgcolor: isOverdue && !isLocked ? "#fff3e0" : "inherit" }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {isLocked && <Lock sx={{ fontSize: 18, color: "#d32f2f" }} />}
                                  {isOverdue && !isLocked && <ErrorIcon sx={{ fontSize: 18, color: "#d32f2f" }} />}
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {task.title}
                                    </Typography>
                                    {task.week_number && (
                                      <Typography variant="caption" color="text.secondary">
                                        Week {task.week_number}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={task.course?.name || 'N/A'}
                                  size="small"
                                  sx={{ bgcolor: LIGHT_GREY, color: BLUE, fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  color={isOverdue ? "#d32f2f" : "text.secondary"}
                                  fontWeight={isOverdue ? 600 : 400}
                                >
                                  {new Date(task.due_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {task.max_marks}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {isLocked ? (
                                  <Tooltip title={task.lock_reason || 'Complete previous task first'}>
                                    <span>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        disabled
                                        startIcon={<Lock />}
                                        sx={{ fontWeight: 600 }}
                                      >
                                        Locked
                                      </Button>
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate(`/student/tasks/${task.id}`)}
                                    sx={{
                                      bgcolor: isOverdue ? "#d32f2f" : "#ff9800",
                                      fontWeight: 600,
                                      color: "#fff",
                                      '&:hover': { bgcolor: isOverdue ? "#b71c1c" : "#f57c00" }
                                    }}
                                  >
                                    Submit
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={pendingTasks.length}
                    page={pendingPage}
                    onPageChange={handlePendingChangePage}
                    rowsPerPage={pendingRowsPerPage}
                    onRowsPerPageChange={handlePendingChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              )}
            </TabPanel>

            {/* Submissions Tab */}
            <TabPanel value={tabValue} index={2}>
              {submissions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Assignment sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                  <Typography variant="h6" color="#555">
                    No Submissions Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Start submitting your tasks to see them here
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                          {["Task Title", "Submitted Date", "Marks Obtained", "Percentage"].map(
                            (head) => (
                              <TableCell key={head} sx={{ fontWeight: 700, color: "#555" }}>
                                {head}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedSubmissions.map((sub) => (
                          <TableRow key={sub.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {sub.task.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(sub.submitted_at).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {sub.marks_obtained !== null ? (
                                <Chip
                                  label={`${sub.marks_obtained}/${sub.task.max_marks}`}
                                  size="small"
                                  sx={{ bgcolor: LIGHT_GREY, color: BLUE, fontWeight: 600 }}
                                />
                              ) : (
                                <Chip
                                  label="Under Review"
                                  size="small"
                                  sx={{ bgcolor: "#fff3cd", color: "#856404", fontWeight: 600 }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {sub.marks_obtained !== null && (
                                <Typography variant="body2" fontWeight={600}>
                                  {Math.round((sub.marks_obtained / sub.task.max_marks) * 100)}%
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={submissions.length}
                    page={submissionsPage}
                    onPageChange={handleSubmissionsChangePage}
                    rowsPerPage={submissionsRowsPerPage}
                    onRowsPerPageChange={handleSubmissionsChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              )}
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentTasks;
