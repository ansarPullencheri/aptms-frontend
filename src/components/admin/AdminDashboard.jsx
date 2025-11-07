import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Paper,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  TablePagination,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  School,
  Assignment,
  PersonAdd,
  Task,
  Menu as MenuIcon,
  Close,
  Visibility,
  Add,
} from '@mui/icons-material';

const BLUE = '#1976d2';
const LIGHT_GREY = '#f5f7fa';
const DARK_GREY = '#555';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalCourses: 0,
    totalBatches: 0,
    totalTasks: 0,
    pendingApprovals: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [students, mentors, courses, tasks, pending, batches] = await Promise.all([
        API.get('/auth/students/'),
        API.get('/auth/mentors/'),
        API.get('/courses/'),
        API.get('/tasks/'),
        API.get('/auth/pending-students/'),
        API.get('/courses/batches/'),
      ]);

      setStats({
        totalStudents: students.data.length,
        totalMentors: mentors.data.length,
        totalCourses: courses.data.length,
        totalTasks: tasks.data.length,
        pendingApprovals: pending.data.length,
        totalBatches: batches.data.length,
      });

      setRecentUsers(students.data.slice(0, 50));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = recentUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage Users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: PersonAdd,
      path: '/admin/student-approval',
      badge: stats.pendingApprovals,
    },
  ];

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: People },
    { title: 'Total Mentors', value: stats.totalMentors, icon: School },
    { title: 'Total Courses', value: stats.totalCourses, icon: Assignment },
    { title: 'Total Batches', value: stats.totalBatches, icon: School },
    { title: 'Total Tasks', value: stats.totalTasks, icon: Task },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: PersonAdd },
  ];

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
                backgroundColor: active ? BLUE : 'transparent',
                '&:hover': { backgroundColor: active ? BLUE : LIGHT_GREY },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#fff' : BLUE }}>
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
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : '#333',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
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

      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin 0.25s ease' }}>
        <Container maxWidth="xl" sx={{ py: 5 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
              Welcome Back, Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System Overview & Management
            </Typography>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      p: 3,
                      bgcolor: '#fff',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: LIGHT_GREY,
                          color: BLUE,
                        }}
                      >
                        <Icon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Action Buttons */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/admin/student-approval')}
                sx={{
                  py: 2,
                  bgcolor: BLUE,
                  color: '#fff',
                  borderRadius: 3,
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#1565c0' },
                }}
              >
                Review Approvals
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<School />}
                onClick={() => navigate('/admin/create-mentor')}
                sx={{
                  py: 2,
                  bgcolor: BLUE,
                  color: '#fff',
                  borderRadius: 3,
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#1565c0' },
                }}
              >
                Add Mentor
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assignment />}
                onClick={() => navigate('/admin/manage-courses')}
                sx={{
                  py: 2,
                  borderColor: BLUE,
                  color: BLUE,
                  borderRadius: 3,
                  fontWeight: 700,
                  '&:hover': { bgcolor: LIGHT_GREY },
                }}
              >
                Manage Courses
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Task />}
                onClick={() => navigate('/admin/manage-tasks')}
                sx={{
                  py: 2,
                  borderColor: BLUE,
                  color: BLUE,
                  borderRadius: 3,
                  fontWeight: 700,
                  '&:hover': { bgcolor: LIGHT_GREY },
                }}
              >
                Manage Tasks
              </Button>
            </Grid>
          </Grid>

          {/* Users Table */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              bgcolor: '#fff',
            }}
          >
            {/* Table Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                Recent Students
              </Typography>
            </Box>

            {recentUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <People sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="#555">
                  No Students Found
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                        <TableCell sx={{ fontWeight: 700, color: DARK_GREY, fontSize: '0.875rem' }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: DARK_GREY, fontSize: '0.875rem' }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: DARK_GREY, fontSize: '0.875rem' }}>
                          Phone
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: DARK_GREY, fontSize: '0.875rem' }}>
                          Username
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: DARK_GREY, fontSize: '0.875rem' }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: DARK_GREY, fontSize: '0.875rem' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          hover
                          sx={{
                            '&:hover': { bgcolor: LIGHT_GREY },
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: BLUE,
                                  color: '#fff',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                }}
                              >
                                {user.first_name?.charAt(0) || user.username?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {user.first_name} {user.last_name || ''}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {user.id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{user.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.phone || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">@{user.username}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.is_approved ? 'Approved' : 'Pending'}
                              size="small"
                              variant={user.is_approved ? 'filled' : 'outlined'}
                              sx={{
                                bgcolor: user.is_approved ? '#e8f5e9' : 'transparent',
                                color: user.is_approved ? '#2e7d32' : '#999',
                                borderColor: user.is_approved ? '#2e7d32' : '#ccc',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate('/admin/manage-users')}
                                sx={{
                                  color: BLUE,
                                  '&:hover': { bgcolor: LIGHT_GREY },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={recentUsers.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  sx={{
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      color: DARK_GREY,
                      fontWeight: 500,
                    },
                  }}
                />
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
