import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Chip,
  Alert,
  IconButton,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Add,
  Assignment,
  School,
  People,
  Task,
  PersonAdd,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Close,
  CalendarToday,
  Grade,
  Person,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const BLUE = '#1976d2';
const LIGHT_GREY = '#f5f7fa';

const ManageTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('tasks');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

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
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch tasks' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Are you sure you want to delete task "${taskTitle}"?`)) return;
    try {
      await API.delete(`/tasks/${taskId}/delete/`);
      setMessage({ type: 'success', text: 'Task deleted successfully' });
      fetchTasks();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error deleting task' });
    }
  };

  const getStatusChip = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) {
      return (
        <Chip
          label="Overdue"
          size="small"
          sx={{ bgcolor: '#d32f2f', color: '#fff', fontWeight: 600 }}
        />
      );
    } else if (due - now < 7 * 24 * 60 * 60 * 1000) {
      return (
        <Chip
          label="Due Soon"
          size="small"
          sx={{ bgcolor: '#ff9800', color: '#fff', fontWeight: 600 }}
        />
      );
    } else {
      return (
        <Chip
          label="Active"
          size="small"
          sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 600 }}
        />
      );
    }
  };

  const getInitials = (firstName, lastName) =>
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

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
        boxShadow: '2px 0 6px rgba(0,0,0,0.04)',
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          p: 2,
        }}
      >
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
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <Icon fontSize="small" />
                  </Badge>
                ) : (
                  <Icon fontSize="small" />
                )}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : '#333',
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
      <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
        <Sidebar />
        <Box
          sx={{
            flex: 1,
            ml: sidebarOpen ? '220px' : '70px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: BLUE }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin 0.25s ease' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: '#fff',
              border: '1px solid #e0e0e0',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                  Manage Tasks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, edit, and track assignments for your courses
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/admin/create-task')}
                sx={{
                  bgcolor: BLUE,
                  color: '#fff',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#1565c0' },
                }}
              >
                Create Task
              </Button>
            </Box>
          </Paper>

          {/* Message Alert */}
          {message.text && (
            <Alert
              severity={message.type}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Table Section */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              bgcolor: '#fff',
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                    <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Task Title
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Batch
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Week
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Max Marks
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Created By
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#555', fontSize: '0.875rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Task sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="#555">
                          No Tasks Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first task to assign work to students
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => navigate('/admin/create-task')}
                          sx={{
                            bgcolor: BLUE,
                            color: '#fff',
                            borderRadius: 2,
                            px: 3,
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#1565c0' },
                          }}
                        >
                          Create Task
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTasks.map((task) => (
                      <TableRow
                        key={task.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: LIGHT_GREY },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {task.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.course?.name || task.course_name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.batch?.name || task.batch_name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ScheduleIcon sx={{ fontSize: 16, color: BLUE }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: BLUE }}>
                              {task.week_number || 1}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<Grade sx={{ fontSize: 16 }} />}
                            label={task.max_marks}
                            size="small"
                            sx={{
                              bgcolor: LIGHT_GREY,
                              color: BLUE,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>{getStatusChip(task.due_date)}</TableCell>
                        <TableCell>
                          {task.created_by || task.created_by_name ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: BLUE,
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                }}
                              >
                                {task.created_by
                                  ? getInitials(task.created_by.first_name, task.created_by.last_name)
                                  : task.created_by_name?.[0] || 'A'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {task.created_by
                                    ? `${task.created_by.first_name} ${task.created_by.last_name}`
                                    : task.created_by_name || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewTask(task)}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': { bgcolor: BLUE, color: '#fff' },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Task">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/edit-task/${task.id}`)}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': { bgcolor: BLUE, color: '#fff' },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Task">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteTask(task.id, task.title)}
                                sx={{
                                  border: `1px solid #d32f2f`,
                                  color: '#d32f2f',
                                  borderRadius: 1.5,
                                  '&:hover': { bgcolor: '#d32f2f', color: '#fff' },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {tasks.length > 0 && (
              <TablePagination
                component="div"
                count={tasks.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: '1px solid #e0e0e0',
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    color: '#555',
                    fontWeight: 500,
                  },
                }}
              />
            )}
          </Paper>
        </Container>
      </Box>

      {/* View Task Dialog */}
      <Dialog
        open={viewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Assignment />
            Task Details
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTask && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
                    {selectedTask.title}
                  </Typography>
                  {getStatusChip(selectedTask.due_date)}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: LIGHT_GREY, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color={BLUE} sx={{ fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#555' }}>
                    {selectedTask.description}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ScheduleIcon sx={{ color: BLUE }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BLUE }}>
                    Week Number
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} color={BLUE}>
                  {selectedTask.week_number || 1}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarToday sx={{ color: BLUE }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BLUE }}>
                    Due Date
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(selectedTask.due_date).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedTask.due_date).toLocaleTimeString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Grade sx={{ color: BLUE }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BLUE }}>
                    Maximum Marks
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} color={BLUE}>
                  {selectedTask.max_marks}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Person sx={{ color: BLUE }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BLUE }}>
                    Created By
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {selectedTask.created_by
                    ? `${selectedTask.created_by.first_name} ${selectedTask.created_by.last_name}`
                    : selectedTask.created_by_name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedTask.created_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseViewDialog} sx={{ borderRadius: 2 }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              handleCloseViewDialog();
              navigate(`/admin/edit-task/${selectedTask.id}`);
            }}
            sx={{
              bgcolor: BLUE,
              borderRadius: 2,
              px: 3,
              color: '#fff',
              '&:hover': { bgcolor: '#1565c0' },
            }}
          >
            Edit Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTasks;
