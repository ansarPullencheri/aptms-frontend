import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Grid, Paper, Typography, Card, CardContent, Box, CircularProgress,
  Avatar, Chip, List, ListItemButton, ListItemIcon, ListItemText, Divider,
  IconButton, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, TablePagination,
} from '@mui/material';
import {
  Assignment, CheckCircle, PendingActions, TrendingUp, School, Dashboard as DashboardIcon,
  Menu as MenuIcon, Close, CalendarToday, Grade, Person, Download, RateReview, Visibility,
} from '@mui/icons-material';

const BLUE = "#1976d2";
const LIGHT_GREY = "#f5f7fa";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: Assignment, path: '/student/tasks' },
    { id: 'submissions', label: 'Submissions', icon: CheckCircle, path: '/student/submissions' },
    { id: 'feedback', label: 'My Feedback', icon: RateReview, path: '/student/progress-feedback' },
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

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSubmissions = dashboardData?.recent_submissions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  ) || [];

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

  const statCards = [
    {
      title: 'Total Tasks',
      value: dashboardData?.task_statistics.total_assigned || 0,
      icon: Assignment,
    },
    {
      title: 'Submitted',
      value: dashboardData?.task_statistics.total_submitted || 0,
      icon: CheckCircle,
    },
    {
      title: 'Pending',
      value: dashboardData?.task_statistics.pending_tasks || 0,
      icon: PendingActions,
    },
   
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_GREY, minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? "220px" : "70px", transition: "margin 0.25s ease" }}>
        <Container maxWidth="xl" sx={{ py: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#222", mb: 4 }}>
            Welcome Back, {dashboardData?.student_info.name} 👋
          </Typography>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      p: 2.5,
                      bgcolor: "#fff",
                      border: "1px solid #e0e0e0",
                      "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
                      transition: "0.3s",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          bgcolor: LIGHT_GREY,
                          color: BLUE,
                          display: "flex",
                        }}
                      >
                        <Icon />
                      </Box>
                      <Box sx={{ minWidth: 127 }}>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#222" }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={3}>
            {/* Enrolled Batches Table */}
            <Grid item xs={12} lg={6} sx={{ minWidth: 480 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fff",
                  height: '100%',
                }}
              >
                <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#222" }}>
                    Enrolled Batches
                  </Typography>
                </Box>

                {dashboardData?.enrolled_batches.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <School sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                    <Typography variant="h6" color="#555">
                      No Batches Enrolled
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                          {["Batch", "Course", "Mentor", "Syllabus"].map((head) => (
                            <TableCell key={head} sx={{ fontWeight: 700, color: "#555" }}>
                              {head}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData?.enrolled_batches.map((batch) => (
                          <TableRow key={batch.id} hover>
                            <TableCell>{batch.name}</TableCell>
                            <TableCell>{batch.course_name}</TableCell>
                            <TableCell>{batch.mentor_name || 'Not assigned'}</TableCell>
                            <TableCell>
                              <Tooltip title="Download Syllabus">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadSyllabus(batch.course_id, batch.course_name)}
                                  sx={{ color: BLUE }}
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
                )}
              </Paper>
            </Grid>

            {/* Recent Submissions Table */}
            <Grid item xs={12} lg={6} sx={{ minWidth: 480 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fff",
                  height: '100%',
                }}
              >
                <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#222" }}>
                    Recent Submissions
                  </Typography>
                </Box>

                {dashboardData?.recent_submissions.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Assignment sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                    <Typography variant="h6" color="#555">
                      No Submissions Yet
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                            {["Task", "Submitted", "Status"].map((head) => (
                              <TableCell key={head} sx={{ fontWeight: 700, color: "#555" }}>
                                {head}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedSubmissions.map((sub, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {sub.task_title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {sub.is_graded ? (
                                  <Chip
                                    label={`${sub.marks_obtained}/${sub.max_marks}`}
                                    size="small"
                                    sx={{
                                      bgcolor: LIGHT_GREY,
                                      color: BLUE,
                                      fontWeight: 600,
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    label="Under Review"
                                    size="small"
                                    sx={{
                                      bgcolor: "#fff3cd",
                                      color: "#856404",
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                      component="div"
                      count={dashboardData?.recent_submissions.length || 0}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25]}
                    />
                  </>
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
