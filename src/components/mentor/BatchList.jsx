import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container, Paper, Typography, Button, Box, CircularProgress, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip,
  TablePagination
} from '@mui/material';
import {
  Visibility, Assignment, People, CheckCircle, School, Dashboard as DashboardIcon, Menu as MenuIcon, Close,
  CalendarToday, Email, Phone, GradeOutlined, AddTask, RateReview,
} from '@mui/icons-material';


const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";


const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [batchTasks, setBatchTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('students');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('batches');
  
  // ✅ Pagination state for main table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // ✅ Pagination state for dialog tables
  const [dialogPage, setDialogPage] = useState(0);
  const [dialogRowsPerPage, setDialogRowsPerPage] = useState(10);
  
  const navigate = useNavigate();


  // ✅ Added Weekly Review to navigation
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/mentor/dashboard' },
    { id: 'batches', label: 'My Batches', icon: People, path: '/mentor/batches' },
    { id: 'create-task', label: 'Create Task', icon: AddTask, path: '/mentor/create-task' },
    { id: 'tasks', label: 'Tasks', icon: Assignment, path: '/mentor/tasks' },
    { id: 'weekly-review', label: 'Weekly Review', icon: RateReview, path: '/mentor/weekly-review' },
  ];


  useEffect(() => { fetchBatches(); }, []);


  const fetchBatches = async () => {
    try {
      const response = await API.get('/courses/mentor/batches/');
      setBatches(response.data);
    } catch (error) { } finally { setLoading(false); }
  };


  // ✅ Pagination handlers for main table
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  // ✅ Pagination handlers for dialog tables
  const handleDialogChangePage = (event, newPage) => {
    setDialogPage(newPage);
  };


  const handleDialogChangeRowsPerPage = (event) => {
    setDialogRowsPerPage(parseInt(event.target.value, 10));
    setDialogPage(0);
  };


  // ✅ Calculate paginated data
  const paginatedBatches = batches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  const paginatedDialogData = dialogContent === 'students' 
    ? batchStudents.slice(dialogPage * dialogRowsPerPage, dialogPage * dialogRowsPerPage + dialogRowsPerPage)
    : batchTasks.slice(dialogPage * dialogRowsPerPage, dialogPage * dialogRowsPerPage + dialogRowsPerPage);


  const handleViewStudents = async (batch) => {
    setSelectedBatch(batch);
    setDialogContent('students');
    setDialogPage(0);
    try {
      const response = await API.get(`/courses/batches/${batch.id}/students/`);
      setBatchStudents(response.data.students || []);
      setOpenDialog(true);
    } catch (error) { }
  };


  const handleViewTasks = async (batch) => {
    setSelectedBatch(batch);
    setDialogContent('tasks');
    setDialogPage(0);
    try {
      const response = await API.get(`/tasks/mentor/batch/${batch.id}/tasks/`);
      setBatchTasks(response.data);
      setOpenDialog(true);
    } catch (error) { }
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
    setBatchStudents([]);
    setBatchTasks([]);
    setDialogPage(0);
  };


  const getInitials = (firstName, lastName) => (
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  );


  // ✅ Sidebar with Weekly Review
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
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: "#fff",
              border: `1.5px solid ${BLUE}`,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE, mb: 1 }}>
                  My Batches
                </Typography>
                <Typography variant="body2" sx={{ color: "#223a5e" }}>
                  Manage your assigned batches, students, and tasks
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  {batches.length}
                </Typography>
                <Typography variant="body2" sx={{ color: "#223a5e" }}>
                  Total Batches
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
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Batch Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Students
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Duration
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <People sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                        <Typography variant="h6" color={BLUE} gutterBottom>
                          No Batches Assigned
                        </Typography>
                        <Typography variant="body2" color="#223a5e">
                          You don't have any batches assigned yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBatches.map((batch) => (
                      <TableRow
                        key={batch.id}
                        hover
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
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Assignment sx={{ fontSize: 16, color: BLUE }} />
                            <Typography variant="body2">
                              {batch.course?.name || 'No Course'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<People sx={{ fontSize: 16 }} />}
                            label={`${batch.student_count || 0} Students`}
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
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                              <Typography variant="caption" color={BLUE}>
                                {new Date(batch.start_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
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
                              color: "#fff",
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="View Students">
                              <IconButton
                                size="small"
                                onClick={() => handleViewStudents(batch)}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': { bgcolor: BLUE, color: "#fff" },
                                }}
                              >
                                <People fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Tasks">
                              <IconButton
                                size="small"
                                onClick={() => handleViewTasks(batch)}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': { bgcolor: BLUE, color: "#fff" },
                                }}
                              >
                                <Assignment fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Grade Submissions">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/mentor/grade-submissions/${batch.id}`)}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  '&:hover': { bgcolor: BLUE, color: "#fff" },
                                }}
                              >
                                <CheckCircle fontSize="small" />
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


            {/* Pagination for main table */}
            {batches.length > 0 && (
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
            )}
          </Paper>
        </Container>
      </Box>


      {/* Students/Tasks Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          bgcolor: BLUE,
          color: 'white',
          fontWeight: 700,
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            {dialogContent === 'students' ? <People /> : <Assignment />}
            {selectedBatch?.name} - {dialogContent === 'students' ? 'Students' : 'Tasks'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 0 }}>
          {dialogContent === 'students' ? (
            batchStudents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <People sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                <Typography color="#223a5e">
                  No students enrolled in this batch yet
                </Typography>
              </Box>
            ) : (
              <Paper elevation={0} sx={{ border: `1.5px solid ${LIGHT_BLUE}`, borderRadius: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Student
                        </TableCell>
                        <TableCell sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Contact
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Assigned
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Submitted
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Pending
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDialogData.map((student) => (
                        <TableRow key={student.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: BLUE,
                                  color: "#fff",
                                  fontWeight: 700
                                }}
                              >
                                {getInitials(student.first_name, student.last_name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {student.first_name} {student.last_name}
                                </Typography>
                                <Typography variant="caption" color="#223a5e">
                                  @{student.username}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Email sx={{ fontSize: 14, color: BLUE }} />
                                <Typography variant="caption" color="#223a5e">{student.email}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone sx={{ fontSize: 14, color: BLUE }} />
                                <Typography variant="caption" color="#223a5e">
                                  {student.phone || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={student.total_assigned_tasks}
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
                              label={student.submitted_tasks}
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
                              label={student.pending_tasks}
                              size="small"
                              sx={{
                                bgcolor: "#fbbc04",
                                color: "#222",
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Student Profile">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  handleCloseDialog();
                                  navigate(`/mentor/batch/${selectedBatch.id}/student/${student.id}`);
                                }}
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>


                <TablePagination
                  component="div"
                  count={batchStudents.length}
                  page={dialogPage}
                  onPageChange={handleDialogChangePage}
                  rowsPerPage={dialogRowsPerPage}
                  onRowsPerPageChange={handleDialogChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{
                    borderTop: `1px solid ${LIGHT_BLUE}`,
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      color: BLUE,
                      fontWeight: 500
                    }
                  }}
                />
              </Paper>
            )
          ) : (
            batchTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Assignment sx={{ fontSize: 64, color: LIGHT_BLUE, mb: 2 }} />
                <Typography color="#223a5e">
                  No tasks assigned to this batch yet
                </Typography>
              </Box>
            ) : (
              <Paper elevation={0} sx={{ border: `1.5px solid ${LIGHT_BLUE}`, borderRadius: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Task Title
                        </TableCell>
                        <TableCell sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Description
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Due Date
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Max Marks
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: LIGHT_BLUE, fontWeight: 700, fontSize: '0.875rem', color: BLUE }}>
                          Submissions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDialogData.map((task) => (
                        <TableRow key={task.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {task.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="#223a5e"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 400,
                              }}
                            >
                              {task.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                              <CalendarToday sx={{ fontSize: 14, color: BLUE }} />
                              <Typography variant="body2" color={BLUE}>
                                {new Date(task.due_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${task.max_marks} Marks`}
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
                              label={`${task.submission_count || 0}`}
                              size="small"
                              sx={{
                                bgcolor: "#0097A7",
                                color: "#fff",
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>


                <TablePagination
                  component="div"
                  count={batchTasks.length}
                  page={dialogPage}
                  onPageChange={handleDialogChangePage}
                  rowsPerPage={dialogRowsPerPage}
                  onRowsPerPageChange={handleDialogChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{
                    borderTop: `1px solid ${LIGHT_BLUE}`,
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      color: BLUE,
                      fontWeight: 500
                    }
                  }}
                />
              </Paper>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default BatchList;
