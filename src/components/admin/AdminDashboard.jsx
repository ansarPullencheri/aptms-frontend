import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button,
  Avatar, Paper, IconButton, Divider, List, ListItemButton, ListItemIcon,
  ListItemText, Badge, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, School, Assignment, PersonAdd,
  Task, Person, Menu as MenuIcon, Close, ChevronRight
} from '@mui/icons-material';

const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalCourses: 0,
    totalTasks: 0,
    pendingApprovals: 0,
    totalBatches: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
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
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally { setLoading(false); }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage Users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    { id: 'approvals', label: 'Approvals', icon: PersonAdd, path: '/admin/student-approval', badge: stats.pendingApprovals },
  ];

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: People },
    { title: 'Total Mentors', value: stats.totalMentors, icon: School },
    { title: 'Total Courses', value: stats.totalCourses, icon: Assignment },
    { title: 'Total Batches', value: stats.totalBatches, icon: School },
    { title: 'Total Tasks', value: stats.totalTasks, icon: Task },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: PersonAdd },
  ];

  const quickActions = [
    { title: 'Approve Students', icon: PersonAdd, path: '/admin/student-approval' },
    { title: 'Create Mentor', icon: School, path: '/admin/create-mentor' },
    { title: 'Manage Courses', icon: Assignment, path: '/admin/manage-courses' },
    { title: 'Manage Batches', icon: School, path: '/admin/manage-batches' },
    { title: 'Create Task', icon: Task, path: '/admin/create-task' },
    { title: 'Manage Users', icon: Person, path: '/admin/manage-users' },
  ];

  // ✅ Simplified Sidebar - matching CreateMentor exactly
  const Sidebar = () => (
    <Box sx={{
      width: sidebarOpen ? 220 : 70,
      height: 'calc(100vh - 64px)',
      bgcolor: '#fff',
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
                color: isActive ? '#fff' : BLUE,
                background: isActive ? BLUE : 'transparent',
                mb: 0.5,
                '&:hover': { background: LIGHT_BLUE },
                px: 2,
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#fff' : BLUE, minWidth: 40 }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#fff' : BLUE,
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
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', bgcolor: LIGHT_BLUE
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 64, height: 64,
            border: `6px solid ${LIGHT_BLUE}`,
            borderTopColor: BLUE,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite', mx: 'auto', mb: 2,
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' },
            }
          }} />
          <Typography variant="h6" color={BLUE}>Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s', px: 0 }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={900} sx={{ color: BLUE }}>Admin Dashboard</Typography>
            <Typography variant="body1" sx={{ color: '#333' }}>Welcome! Here's your system overview and quick actions.</Typography>
          </Box>
          <Grid container spacing={3}>
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card sx={{
                    borderRadius: 3, boxShadow: `0 6px 18px ${LIGHT_BLUE}`,
                    p: 0, bgcolor: '#fff', color: BLUE, border: `1.7px solid ${BLUE}`
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                          bgcolor: LIGHT_BLUE, color: BLUE, width: 42, height: 42
                        }}>
                          <Icon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ color: BLUE }}>{stat.title}</Typography>
                          <Typography variant="h4" fontWeight={800} sx={{ color: '#333' }}>{stat.value}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          <Paper elevation={0} sx={{
            p: 4, mt: 6, borderRadius: 4, border: `1.7px solid ${BLUE}`,
            bgcolor: '#fff', display: 'flex', flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: BLUE }}>Quick Actions</Typography>
              <ChevronRight sx={{ color: BLUE, fontSize: 26 }} />
            </Box>
            <Grid container spacing={2}>
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Button
                      fullWidth variant="contained"
                      onClick={() => navigate(action.path)}
                      sx={{
                        py: 2, background: BLUE, color: '#fff',
                        fontWeight: 700, borderRadius: 3,
                        '&:hover': { background: '#003c8f' },
                        transition: 'all 0.3s',
                      }}
                      startIcon={<Icon />}
                    >
                      {action.title}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
