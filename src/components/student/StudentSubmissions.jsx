import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Box, CircularProgress, Chip, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, LinearProgress,
} from '@mui/material';
import {
  Assignment, CheckCircle, Dashboard as DashboardIcon, Menu as MenuIcon, Close,
  CalendarToday, Grade, RateReview,
} from '@mui/icons-material';

const BLUE = "#1976d2";
const LIGHT_GREY = "#f5f7fa";

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('submissions');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: Assignment, path: '/student/tasks' },
    { id: 'submissions', label: 'Submissions', icon: CheckCircle, path: '/student/submissions' },
    { id: 'feedback', label: 'My Feedback', icon: RateReview, path: '/student/progress-feedback' },
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
            bgcolor: "#4caf50", 
            color: "#fff", 
            fontWeight: 600,
          }}
        />
      );
    }
    return (
      <Chip
        label="Under Review"
        size="small"
        sx={{
          bgcolor: "#ff9800", 
          color: "#fff", 
          fontWeight: 600,
        }}
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
            My Submissions 📋
          </Typography>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              bgcolor: "#fff",
            }}
          >
            <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#222" }}>
                Submitted Assignments
              </Typography>
            </Box>

            {submissions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CheckCircle sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
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
                        <TableCell sx={{ fontWeight: 700, color: "#555" }}>
                          Task Title
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#555" }}>
                          Course
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#555" }}>
                          Submitted Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#555" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#555" }}>
                          Score
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#555" }}>
                          Percentage
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSubmissions.map((submission) => {
                        const taskTitle = submission.task?.title || submission.task_title || 'N/A';
                        const courseName = submission.task?.course?.name || submission.course_name || 'N/A';
                        const maxMarks = submission.task?.max_marks || submission.max_marks || 100;
                        const percentage = submission.marks_obtained !== null && submission.marks_obtained !== undefined
                          ? Math.round((submission.marks_obtained / maxMarks) * 100)
                          : null;

                        return (
                          <TableRow key={submission.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {taskTitle}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={courseName}
                                size="small"
                                sx={{
                                  bgcolor: LIGHT_GREY, 
                                  color: BLUE, 
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(submission.submitted_at).toLocaleDateString()}
                              </Typography>
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
                                    bgcolor: LIGHT_GREY, 
                                    color: BLUE, 
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Not graded yet
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {percentage !== null ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box sx={{ flex: 1, minWidth: 80 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={percentage}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: "#e0e0e0",
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: percentage >= 70 ? "#4caf50" : percentage >= 50 ? "#ff9800" : "#d32f2f",
                                          borderRadius: 3,
                                        }
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                                    {percentage}%
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  —
                                </Typography>
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
                  count={submissions.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentSubmissions;
