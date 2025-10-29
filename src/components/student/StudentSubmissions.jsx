import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Box, CircularProgress, Avatar, Chip, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
} from '@mui/material';
import {
  Assignment, CheckCircle, School, Dashboard as DashboardIcon, Menu as MenuIcon, Close,
  CalendarToday, Grade, Person,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('submissions');
  
  // ✅ Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: Assignment, path: '/student/tasks' },
    { id: 'submissions', label: 'Submissions', icon: CheckCircle, path: '/student/submissions' },
  ];

  useEffect(() => { 
    fetchSubmissions(); 
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/student/submissions/');
      setSubmissions(response.data);
    } catch {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
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
  const paginatedSubmissions = submissions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusChip = (submission) => {
    if (submission.marks_obtained !== null && submission.marks_obtained !== undefined) {
      return (
        <Chip
          label="Graded"
          size="small"
          icon={<Grade sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: "#009688", color: "#fff", fontWeight: 700,
          }}
        />
      );
    }
    return (
      <Chip
        label="Under Review"
        size="small"
        sx={{
          bgcolor: "#fbbc04", color: "#222", fontWeight: 700,
        }}
      />
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

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper elevation={0} sx={{
            p: 3, mb: 4, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${BLUE}`, color: BLUE
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{
                  width: 64, height: 64, bgcolor: BLUE, color: "#fff"
                }}>
                  <CheckCircle sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                    My Submissions
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#223a5e" }}>
                    Track all your submitted assignments and grades
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  {submissions.length}
                </Typography>
                <Typography variant="body2" sx={{ color: "#223a5e" }}>
                  Total Submissions
                </Typography>
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
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>
                      Task Title
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>
                      Submitted Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>
                      Score
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>
                      Progress
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <CheckCircle sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                        <Typography variant="h6" color={BLUE} gutterBottom>
                          No Submissions Yet
                        </Typography>
                        <Typography variant="body2" color="#223a5e">
                          Start submitting your tasks to see them here
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSubmissions.map((submission) => {
                      const taskTitle = submission.task?.title || submission.task_title || 'N/A';
                      const courseName = submission.task?.course?.name || submission.course_name || 'N/A';
                      const maxMarks = submission.task?.max_marks || submission.max_marks || 100;
                      return (
                        <TableRow
                          key={submission.id}
                          hover
                          sx={{ '&:hover': { bgcolor: LIGHT_BLUE } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color={BLUE}>
                              {taskTitle}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={courseName}
                              size="small"
                              sx={{
                                bgcolor: LIGHT_BLUE, color: BLUE, fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarToday sx={{ fontSize: 16, color: BLUE }} />
                              <Typography variant="body2" color={BLUE}>
                                {new Date(submission.submitted_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(submission)}
                          </TableCell>
                          <TableCell>
                            {submission.marks_obtained !== null && submission.marks_obtained !== undefined ? (
                              <Chip
                                icon={<Grade sx={{ fontSize: 14 }} />}
                                label={`${submission.marks_obtained}/${maxMarks}`}
                                size="small"
                                sx={{
                                  bgcolor: "#009688", color: "#fff", fontWeight: 700,
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="#223a5e">
                                Not graded yet
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.marks_obtained !== null && submission.marks_obtained !== undefined && maxMarks > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 150 }}>
                                <Box sx={{
                                  flex: 1,
                                  height: 8,
                                  bgcolor: "#b2dfdb",
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                }}>
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${(submission.marks_obtained / maxMarks) * 100}%`,
                                      bgcolor: "#009688",
                                      borderRadius: 4,
                                      transition: 'width 0.5s ease'
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 45, color: BLUE }}>
                                  {Math.round((submission.marks_obtained / maxMarks) * 100)}%
                                </Typography>
                              </Box>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ✅ Pagination Component */}
            {submissions.length > 0 && (
              <TablePagination
                component="div"
                count={submissions.length}
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
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentSubmissions;
