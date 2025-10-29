import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Box, Container, Typography, Button, Chip, Paper, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, Avatar, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Group, Assignment, GradeOutlined, Menu as MenuIcon, Close,
  School, AddTask, CalendarToday, People
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const MentorTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('tasks');
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/mentor/dashboard' },
    { id: 'batches', label: 'My Batches', icon: Group, path: '/mentor/batches' },
    { id: 'create-task', label: 'Create Task', icon: AddTask, path: '/mentor/create-task' },
    { id: 'tasks', label: 'Tasks', icon: Assignment, path: '/mentor/tasks' },
  ];

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const response = await API.get('/tasks/mentor/tasks/');
      setTasks(response.data.tasks || []);
    } catch (error) { } finally { setLoading(false); }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  // ✅ Simplified Sidebar - matching admin pages exactly
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
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: "#fff",
              border: `1.5px solid ${BLUE}`,
              color: BLUE
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 1 }}>
                  All Batch Tasks
                </Typography>
                <Typography variant="body2" sx={{ color: "#223a5e" }}>
                  View all tasks assigned to students in your batches
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                    {tasks.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#223a5e" }}>
                    Total Tasks
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddTask />}
                  onClick={() => navigate('/mentor/create-task')}
                  sx={{
                    bgcolor: BLUE,
                    color: "#fff",
                    borderRadius: 2,
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: "#003c8f",
                      transform: 'scale(1.04)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Create Task
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1.5px solid ${LIGHT_BLUE}`,
            bgcolor: "#fff",
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Task Title
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Batch / Course
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Assigned
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Submitted
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Pending
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Due Date
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Assignment sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                        <Typography variant="h6" color={BLUE} gutterBottom>
                          No Tasks Found
                        </Typography>
                        <Typography variant="body2" color="#223a5e" sx={{ mb: 3 }}>
                          No tasks have been assigned to your batch students yet
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddTask />}
                          onClick={() => navigate('/mentor/create-task')}
                          sx={{
                            bgcolor: BLUE,
                            color: "#fff",
                            borderRadius: 2,
                            px: 3,
                            fontWeight: 700,
                            '&:hover': { bgcolor: "#003c8f" }
                          }}
                        >
                          Create Task
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow
                        key={task.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: LIGHT_BLUE },
                          transition: 'background-color 0.2s',
                        }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography
                              variant="caption"
                              color="#223a5e"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <People sx={{ fontSize: 16, color: BLUE }} />
                              {task.batch_name}
                            </Typography>
                            <Typography variant="caption" color="#223a5e" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Assignment sx={{ fontSize: 14, color: BLUE }} />
                              {task.course_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={task.total_students}
                            size="small"
                            sx={{
                              bgcolor: LIGHT_BLUE,
                              color: BLUE,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={task.submission_count}
                            size="small"
                            sx={{
                              bgcolor: "#0097A7",
                              color: "#fff",
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={task.pending_grading}
                            size="small"
                            sx={{
                              bgcolor: "#fbbc04",
                              color: "#222",
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                              <Typography variant="body2" color={BLUE}>
                                {new Date(task.due_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={0.5} flexWrap="wrap">
                              <Chip
                                label={`${task.max_marks} Marks`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.7rem',
                                  bgcolor: LIGHT_BLUE,
                                  color: BLUE,
                                  fontWeight: 700,
                                }}
                              />
                              {isOverdue(task.due_date) && (
                                <Chip
                                  label="Overdue"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.7rem',
                                    bgcolor: "#d32f2f",
                                    color: "#fff",
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<GradeOutlined />}
                            onClick={() => {
                              if (task.batch_id) {
                                navigate(`/mentor/grade-submissions/${task.batch_id}`);
                              } else {
                                navigate('/mentor/grading');
                              }
                            }}
                            disabled={task.submission_count === 0}
                            sx={{
                              bgcolor: BLUE,
                              color: "#fff",
                              borderRadius: 2,
                              fontWeight: 700,
                              px: 2,
                              '&:hover': {
                                bgcolor: "#003c8f",
                                transform: 'scale(1.05)',
                              },
                              '&:disabled': {
                                bgcolor: '#e0e0e0',
                                color: '#9e9e9e',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            Grade ({task.pending_grading})
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default MentorTasks;
