import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Box, CircularProgress, Avatar, Chip, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Button, Alert, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TablePagination,
} from '@mui/material';
import {
  Assignment, CheckCircle, PendingActions, School, Dashboard as DashboardIcon, Menu as MenuIcon, Close,
  CalendarToday, Grade, Person, AccessTime, ArrowForward, Error as ErrorIcon, Visibility, Lock, Schedule as ScheduleIcon
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
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
  
  // ✅ Pagination state for each tab
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

  // ✅ Pagination handlers for All Tasks tab
  const handleAllTasksChangePage = (event, newPage) => {
    setAllTasksPage(newPage);
  };

  const handleAllTasksChangeRowsPerPage = (event) => {
    setAllTasksRowsPerPage(parseInt(event.target.value, 10));
    setAllTasksPage(0);
  };

  // ✅ Pagination handlers for Pending tab
  const handlePendingChangePage = (event, newPage) => {
    setPendingPage(newPage);
  };

  const handlePendingChangeRowsPerPage = (event) => {
    setPendingRowsPerPage(parseInt(event.target.value, 10));
    setPendingPage(0);
  };

  // ✅ Pagination handlers for Submissions tab
  const handleSubmissionsChangePage = (event, newPage) => {
    setSubmissionsPage(newPage);
  };

  const handleSubmissionsChangeRowsPerPage = (event) => {
    setSubmissionsRowsPerPage(parseInt(event.target.value, 10));
    setSubmissionsPage(0);
  };

  // ✅ Calculate paginated data
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
        <Chip label="Locked" size="small" icon={<Lock sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: "#e0e0e0", color: "#666", fontWeight: 700,
          }} />
      );
    }
    const isSubmitted = task.is_submitted || submissions.some(sub => sub.task.id === task.id);
    if (isSubmitted) {
      return (
        <Chip label="Submitted" size="small"
          sx={{
            bgcolor: "#009688", color: "#fff", fontWeight: 700,
          }} />
      );
    }
    const dueDate = new Date(task.due_date);
    const now = new Date();
    if (dueDate < now) {
      return (
        <Chip label="Overdue" size="small"
          sx={{
            bgcolor: "#D84315", color: "#fff", fontWeight: 700,
          }} />
      );
    }
    return (
      <Chip label="Pending" size="small"
        sx={{
          bgcolor: "#fbbc04", color: "#222", fontWeight: 700,
        }} />
    );
  };

  // ✅ Simplified Sidebar - matching all other pages
  const Sidebar = () => (
    <Box
      sx={{
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
                color: isActive ? '#fff' : BLUE,
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

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper elevation={0} sx={{
            p: 3, mb: 4, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${BLUE}`, color: BLUE
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{
                width: 64, height: 64, bgcolor: BLUE, color: "#fff",
              }}>
                <Assignment sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  My Tasks
                </Typography>
                <Typography variant="body2" sx={{ color: "#223a5e" }}>
                  Manage and track your assignments with weekly progression
                </Typography>
              </Box>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={0} sx={{
            borderRadius: 3,
            border: `1.5px solid ${LIGHT_BLUE}`,
            bgcolor: "#fff",
          }}>
            <Box sx={{ borderBottom: 1, borderColor: LIGHT_BLUE }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  px: 3, bgcolor: "#fff",
                  '& .MuiTab-root': {
                    textTransform: 'none', fontWeight: 600, fontSize: '1rem', color: BLUE,
                  },
                  '& .Mui-selected': { color: BLUE + '!important' }
                }}
              >
                <Tab icon={<Assignment />} iconPosition="start" label={`All Tasks (${allTasks.length})`} />
                <Tab icon={<PendingActions />} iconPosition="start" label={`Pending (${pendingTasks.length})`} />
                <Tab icon={<CheckCircle />} iconPosition="start" label={`Submitted (${submissions.length})`} />
              </Tabs>
            </Box>

            {/* All Tasks */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3 }}>
                {allTasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Assignment sx={{ fontSize: 80, color: LIGHT_BLUE, mb: 2 }} />
                    <Typography variant="h6" color="#223a5e">
                      No tasks assigned yet
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Task Details</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Due Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Max Marks</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: BLUE }}>Action</TableCell>
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
                              <TableRow
                                key={task.id}
                                sx={{
                                  '&:hover': { bgcolor: LIGHT_BLUE },
                                  opacity: isLocked ? 0.6 : 1,
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isLocked && <Lock sx={{ fontSize: 18, color: "#D84315" }} />}
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: BLUE }}>
                                        {task.title}
                                      </Typography>
                                      {task.week_number && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                          <ScheduleIcon sx={{ fontSize: 14, color: BLUE }} />
                                          <Typography variant="caption" color={BLUE}>
                                            Week {task.week_number}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={task.course?.name || 'N/A'}
                                    size="small"
                                    sx={{
                                      bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 700,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarToday
                                      sx={{
                                        fontSize: 16,
                                        color: isOverdue && !isSubmitted ? "#D84315" : BLUE
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isOverdue && !isSubmitted ? "#D84315" : BLUE,
                                        fontWeight: isOverdue && !isSubmitted ? 600 : 400,
                                      }}
                                    >
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Grade sx={{ fontSize: 16, color: BLUE }} />
                                    <Typography variant="body2" color={BLUE}>
                                      {task.max_marks}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {getStatusChip(task)}
                                </TableCell>
                                <TableCell align="right">
                                  {isLocked ? (
                                    <Tooltip title={task.lock_reason || 'Complete previous task first'} arrow>
                                      <span>
                                        <Button
                                          variant="contained"
                                          size="small"
                                          disabled
                                          startIcon={<Lock />}
                                          sx={{
                                            fontWeight: 700, bgcolor: "#e0e0e0", color: "#666"
                                          }}
                                        >
                                          Locked
                                        </Button>
                                      </span>
                                    </Tooltip>
                                  ) : isSubmitted ? (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      endIcon={<Visibility />}
                                      onClick={() => navigate(`/student/tasks/${task.id}`)}
                                      sx={{
                                        fontWeight: 700,
                                        borderColor: "#009688", color: "#009688",
                                        '&:hover': { borderColor: "#009688", bgcolor: "#b2dfdb" }
                                      }}
                                    >
                                      View
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      endIcon={<ArrowForward />}
                                      onClick={() => navigate(`/student/tasks/${task.id}`)}
                                      sx={{
                                        bgcolor: isOverdue ? "#D84315" : BLUE,
                                        fontWeight: 700, color: "#fff",
                                        '&:hover': { bgcolor: isOverdue ? "#b71c1c" : "#003c8f" }
                                      }}
                                    >
                                      {isOverdue ? 'Submit Now' : 'Submit'}
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* ✅ Pagination for All Tasks */}
                    <TablePagination
                      component="div"
                      count={allTasks.length}
                      page={allTasksPage}
                      onPageChange={handleAllTasksChangePage}
                      rowsPerPage={allTasksRowsPerPage}
                      onRowsPerPageChange={handleAllTasksChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      sx={{
                        borderTop: `1px solid ${LIGHT_BLUE}`,
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                          color: BLUE,
                          fontWeight: 500
                        }
                      }}
                    />
                  </>
                )}
              </Box>
            </TabPanel>

            {/* Pending */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3 }}>
                {pendingTasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CheckCircle sx={{ fontSize: 80, color: LIGHT_BLUE, mb: 2 }} />
                    <Typography variant="h6" color="#223a5e">
                      No pending tasks
                    </Typography>
                    <Typography variant="body2" color="#223a5e" sx={{ mt: 1 }}>
                      Great job! You're all caught up
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Task Details</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Due Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Max Marks</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: BLUE }}>Action</TableCell>
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
                                sx={{
                                  bgcolor: isOverdue ? "#fff3e0" : "#fff",
                                  opacity: isLocked ? 0.6 : 1,
                                  '&:hover': { bgcolor: LIGHT_BLUE },
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isLocked && <Lock sx={{ fontSize: 18, color: "#D84315" }} />}
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: BLUE }}>
                                        {task.title}
                                      </Typography>
                                      {task.week_number && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                          <ScheduleIcon sx={{ fontSize: 14, color: BLUE }} />
                                          <Typography variant="caption" color={BLUE}>
                                            Week {task.week_number}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                    {isOverdue && !isLocked && (
                                      <ErrorIcon sx={{ color: "#D84315", fontSize: 18 }} />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={task.course?.name || 'N/A'}
                                    size="small"
                                    sx={{
                                      bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 700,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTime sx={{ fontSize: 16, color: isOverdue ? "#D84315" : BLUE }} />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isOverdue ? "#D84315" : BLUE,
                                        fontWeight: isOverdue ? 700 : 400,
                                      }}
                                    >
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Grade sx={{ fontSize: 16, color: BLUE }} />
                                    <Typography variant="body2" color={BLUE}>
                                      {task.max_marks}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  {isLocked ? (
                                    <Tooltip title={task.lock_reason || 'Complete previous task first'} arrow>
                                      <span>
                                        <Button
                                          variant="contained"
                                          size="small"
                                          disabled
                                          startIcon={<Lock />}
                                          sx={{
                                            fontWeight: 700, bgcolor: "#e0e0e0", color: "#666"
                                          }}
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
                                        bgcolor: isOverdue ? "#D84315" : "#fbbc04",
                                        fontWeight: 700, color: "#fff",
                                        '&:hover': { bgcolor: isOverdue ? "#b71c1c" : "#FFA000" }
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

                    {/* ✅ Pagination for Pending Tasks */}
                    <TablePagination
                      component="div"
                      count={pendingTasks.length}
                      page={pendingPage}
                      onPageChange={handlePendingChangePage}
                      rowsPerPage={pendingRowsPerPage}
                      onRowsPerPageChange={handlePendingChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      sx={{
                        borderTop: `1px solid ${LIGHT_BLUE}`,
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                          color: BLUE,
                          fontWeight: 500
                        }
                      }}
                    />
                  </>
                )}
              </Box>
            </TabPanel>

            {/* Submissions */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3 }}>
                {submissions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Assignment sx={{ fontSize: 80, color: LIGHT_BLUE, mb: 2 }} />
                    <Typography variant="h6" color="#223a5e">
                      No submissions yet
                    </Typography>
                    <Typography variant="body2" color="#223a5e" sx={{ mt: 1 }}>
                      Start submitting your tasks to see them here
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Task Title</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Submitted Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Marks Obtained</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: BLUE }}>Progress</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedSubmissions.map((sub) => (
                            <TableRow
                              key={sub.id}
                              sx={{
                                '&:hover': { bgcolor: LIGHT_BLUE }
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: BLUE }}>
                                  {sub.task.title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarToday sx={{ fontSize: 16, color: BLUE }} />
                                  <Typography variant="body2" color={BLUE}>
                                    {new Date(sub.submitted_at).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {sub.marks_obtained !== null ? (
                                  <Chip
                                    icon={<Grade sx={{ fontSize: 14 }} />}
                                    label={`${sub.marks_obtained}/${sub.task.max_marks}`}
                                    size="small"
                                    sx={{
                                      bgcolor: "#009688", color: "#fff", fontWeight: 700,
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    label="Pending Evaluation"
                                    size="small"
                                    sx={{
                                      bgcolor: "#e0e0e0", color: "#666", fontWeight: 700,
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {sub.marks_obtained !== null && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                      flex: 1, height: 8, bgcolor: "#b2dfdb", borderRadius: 4,
                                      overflow: 'hidden'
                                    }}>
                                      <Box
                                        sx={{
                                          height: '100%',
                                          width: `${(sub.marks_obtained / sub.task.max_marks) * 100}%`,
                                          bgcolor: "#009688", borderRadius: 4, transition: 'width 0.5s ease'
                                        }}
                                      />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 45, color: BLUE }}>
                                      {Math.round((sub.marks_obtained / sub.task.max_marks) * 100)}%
                                    </Typography>
                                  </Box>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* ✅ Pagination for Submissions */}
                    <TablePagination
                      component="div"
                      count={submissions.length}
                      page={submissionsPage}
                      onPageChange={handleSubmissionsChangePage}
                      rowsPerPage={submissionsRowsPerPage}
                      onRowsPerPageChange={handleSubmissionsChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      sx={{
                        borderTop: `1px solid ${LIGHT_BLUE}`,
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                          color: BLUE,
                          fontWeight: 500
                        }
                      }}
                    />
                  </>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentTasks;
