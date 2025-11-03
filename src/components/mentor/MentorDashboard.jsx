import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, Avatar, Chip, Paper,
  IconButton, List, ListItemButton, ListItemIcon, ListItemText, Divider, useTheme, useMediaQuery,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TablePagination
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Group, Assignment, Schedule, School, Menu as MenuIcon, Close,
  GradeOutlined, AddTask, Visibility, Edit, CalendarToday, Assessment, RateReview
} from '@mui/icons-material';



const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";



const MentorDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalStudents: 0,
    totalTasks: 0,
    pendingGrading: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // ✅ Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));



  useEffect(() => { fetchDashboardData(); }, []);



  const fetchDashboardData = async () => {
    try {
      const batchResponse = await API.get('/courses/mentor/batches/');
      setBatches(batchResponse.data);
      const totalStudents = batchResponse.data.reduce(
        (sum, batch) => sum + (batch.student_count || 0), 0
      );
      setStats({
        totalBatches: batchResponse.data.length,
        totalStudents: totalStudents,
        totalTasks: 0,
        pendingGrading: 0,
      });
    } catch (error) { } finally { setLoading(false); }
  };



  // ✅ Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };



  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };



  // ✅ Calculate paginated data
  const paginatedBatches = batches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );



  // ✅ UPDATED - Added My Reviews to navigation
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/mentor/dashboard' },
    { id: 'batches', label: 'My Batches', icon: Group, path: '/mentor/batches' },
    { id: 'create-task', label: 'Create Task', icon: AddTask, path: '/mentor/create-task' },
    { id: 'tasks', label: 'Tasks', icon: Assignment, path: '/mentor/tasks' },
    { id: 'weekly-review', label: 'Weekly Review', icon: Assessment, path: '/mentor/weekly-review' },
    { id: 'my-reviews', label: 'My Reviews', icon: RateReview, path: '/mentor/reviews' }, // ✅ NEW
  ];



  const statCards = [
    { title: 'My Batches', value: stats.totalBatches, icon: Group, color: BLUE },
    { title: 'Total Students', value: stats.totalStudents, icon: Group, color: "#0097A7" },
    { title: 'Tasks Assigned', value: stats.totalTasks, icon: Assignment, color: "#1976d2" },
    { title: 'Pending Grading', value: stats.pendingGrading, icon: Schedule, color: "#D84315" },
  ];



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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: LIGHT_BLUE, pt: '64px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 60, height: 60, border: '4px solid #e0e0e0', borderTopColor: BLUE, borderRadius: '50%',
            animation: 'spin 1s linear infinite', mx: 'auto', mb: 2,
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' }
            },
          }} />
          <Typography variant="body1" color="#223a5e">Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }



  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />



      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Stats Grid */}
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
                          <Typography variant="body2" color="#223a5e" sx={{ mb: 1 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: LIGHT_BLUE,
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



          {/* Assigned Batches Table */}
          <Paper elevation={0} sx={{
            borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}`, bgcolor: "#fff", overflow: 'hidden'
          }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${LIGHT_BLUE}` }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: BLUE }}>
                My Assigned Batches
              </Typography>
            </Box>



            {batches.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Group sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                <Typography variant="h6" color={BLUE}>No Batches Assigned</Typography>
                <Typography color="#223a5e">You don't have any batches assigned yet</Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Batch Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Students</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BLUE }}>Status</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBatches.map((batch) => (
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
                              <Typography variant="body2">
                                {batch.course.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Group sx={{ fontSize: 16 }} />}
                              label={`${batch.student_count || 0}/${batch.max_students}`}
                              size="small"
                              sx={{
                                bgcolor: LIGHT_BLUE,
                                color: BLUE,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                                <Typography variant="caption" color={BLUE}>
                                  {new Date(batch.start_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                                <Typography variant="caption" color={BLUE}>
                                  {new Date(batch.end_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={batch.is_active ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                bgcolor: batch.is_active ? BLUE : "#e0e0e0",
                                color: batch.is_active ? '#fff' : BLUE,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate('/mentor/batches')}
                                  sx={{
                                    border: `1px solid ${BLUE}`,
                                    borderRadius: 1.5,
                                    color: BLUE,
                                    '&:hover': { bgcolor: BLUE, color: "#fff" },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Grade Submissions">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/mentor/grade-submissions/${batch.id}`)}
                                  sx={{
                                    border: `1px solid #0097A7`,
                                    borderRadius: 1.5,
                                    color: '#0097A7',
                                    '&:hover': { bgcolor: '#0097A7', color: "#fff" },
                                  }}
                                >
                                  <GradeOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>



                {/* ✅ Pagination Component */}
                <TablePagination
                  component="div"
                  count={batches.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
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
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};



export default MentorDashboard;
