import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Grid, Paper, Typography, Card, CardContent, Box, CircularProgress,
  Avatar, Chip, List, ListItemButton, ListItemIcon, ListItemText, Divider,
  IconButton, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip,
} from '@mui/material';
import {
  Assignment, CheckCircle, PendingActions, TrendingUp, School, Dashboard as DashboardIcon,
  Menu as MenuIcon, Close, CalendarToday, Grade, Person, Download,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: Assignment, path: '/student/tasks' },
    { id: 'submissions', label: 'Submissions', icon: CheckCircle, path: '/student/submissions' },
  ];

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get('/auth/student/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally { 
      setLoading(false); 
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  // ✅ Download syllabus handler
  const handleDownloadSyllabus = async (courseId, courseName) => {
    try {
      const response = await API.get(`/courses/${courseId}/download-syllabus/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${courseName}_Syllabus.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading syllabus:', error);
      alert('Failed to download syllabus. Please try again.');
    }
  };

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

  const statCards = [
    {
      title: 'Total Tasks',
      value: dashboardData?.task_statistics.total_assigned || 0,
      icon: Assignment,
      color: BLUE,
      bgLight: LIGHT_BLUE,
    },
    {
      title: 'Submitted',
      value: dashboardData?.task_statistics.total_submitted || 0,
      icon: CheckCircle,
      color: "#009688",
      bgLight: "#b2dfdb",
    },
    {
      title: 'Pending',
      value: dashboardData?.task_statistics.pending_tasks || 0,
      icon: PendingActions,
      color: "#fbbc04",
      bgLight: "#fffde7",
    },
    {
      title: 'Overall Score',
      value: `${dashboardData?.academic_progress.overall_percentage || 0}%`,
      icon: TrendingUp,
      color: "#1976d2",
      bgLight: "#e3f2fd",
    },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Welcome Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3, mb: 4, borderRadius: 3,
              bgcolor: "#fff",
              border: `1.5px solid ${BLUE}`,
              color: BLUE
            }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{
                width: 64, height: 64, bgcolor: BLUE, color: "#fff",
                fontSize: '1.5rem', fontWeight: 700,
              }}>
                {getInitials(dashboardData?.student_info.name)}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  Welcome back, {dashboardData?.student_info.name}!
                </Typography>
                <Typography variant="body2" sx={{ color: "#223a5e" }}>
                  Here's your learning progress overview
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: `1.5px solid ${LIGHT_BLUE}`,
                      bgcolor: "#fff",
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(21,101,192,0.11)',
                      },
                    }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ color: BLUE, mb: 1 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box sx={{
                          p: 1.5, borderRadius: 2, bgcolor: stat.bgLight,
                        }}>
                          <Icon sx={{ fontSize: 32, color: stat.color }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={3}>
            {/* Enrolled Batches */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}`,
                  height: '100%', bgcolor: "#fff"
                }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE }}>
                    Enrolled Batches
                  </Typography>
                  <Chip
                    label={dashboardData?.enrolled_batches.length || 0}
                    size="small"
                    sx={{
                      bgcolor: BLUE, color: "#fff", fontWeight: 700,
                    }}
                  />
                </Box>
                {dashboardData?.enrolled_batches.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <School sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                    <Typography color="#223a5e">
                      No batches enrolled yet
                    </Typography>
                  </Box>
                ) : (
                  <Paper elevation={0} sx={{ border: `1.5px solid ${LIGHT_BLUE}`, borderRadius: 2 }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                              Batch Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                              Course
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                              Mentor
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                              Syllabus
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData?.enrolled_batches.map((batch) => (
                            <TableRow
                              key={batch.id}
                              sx={{
                                '&:hover': { bgcolor: LIGHT_BLUE },
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {batch.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <School sx={{ fontSize: 16, color: BLUE }} />
                                  <Typography variant="body2" color={BLUE}>
                                    {batch.course_name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Person sx={{ fontSize: 16, color: BLUE }} />
                                  <Typography variant="body2" color="#223a5e">
                                    {batch.mentor_name || 'Not assigned'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Download Syllabus">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadSyllabus(batch.course_id, batch.course_name)}
                                    sx={{
                                      color: BLUE,
                                      bgcolor: LIGHT_BLUE,
                                      '&:hover': { bgcolor: BLUE, color: '#fff' },
                                      transition: 'all 0.3s'
                                    }}
                                  >
                                    <Download fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Paper>
            </Grid>

            {/* Recent Submissions */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}`,
                  height: '100%', bgcolor: "#fff"
                }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: BLUE }}>
                    Recent Submissions
                  </Typography>
                  <Chip
                    label={dashboardData?.recent_submissions.length || 0}
                    size="small"
                    sx={{
                      bgcolor: BLUE, color: "#fff", fontWeight: 700,
                    }}
                  />
                </Box>
                {dashboardData?.recent_submissions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Assignment sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                    <Typography color="#223a5e">
                      No submissions yet
                    </Typography>
                  </Box>
                ) : (
                  <Paper elevation={0} sx={{ border: `1.5px solid ${LIGHT_BLUE}`, borderRadius: 2 }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                              Task
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                              Submitted
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData?.recent_submissions.map((sub, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                '&:hover': { bgcolor: LIGHT_BLUE },
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {sub.task_title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                                  <Typography variant="body2" color={BLUE}>
                                    {new Date(sub.submitted_at).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {sub.is_graded ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                    <Chip
                                      icon={<Grade sx={{ fontSize: 14 }} />}
                                      label={`${sub.marks_obtained}/${sub.max_marks}`}
                                      size="small"
                                      sx={{
                                        bgcolor: "#009688", color: "#fff", fontWeight: 700,
                                      }}
                                    />
                                    <LinearProgress
                                      variant="determinate"
                                      value={(sub.marks_obtained / sub.max_marks) * 100}
                                      sx={{
                                        width: '100%',
                                        height: 4,
                                        borderRadius: 3,
                                        bgcolor: "#b2dfdb",
                                        '& .MuiLinearProgress-bar': { bgcolor: "#009688", borderRadius: 3 }
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  <Chip
                                    label="Under Review"
                                    size="small"
                                    sx={{
                                      bgcolor: "#fbbc04", color: "#fff", fontWeight: 700,
                                    }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
