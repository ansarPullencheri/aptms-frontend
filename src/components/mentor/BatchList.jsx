import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Group,
  Assignment,
  Menu as MenuIcon,
  Close,
  CalendarToday,
  School,
  AddTask,
  Visibility,
  Email,
  Phone,
  CheckCircle,
  RateReview,
  Assessment,
  People,
} from "@mui/icons-material";

const BLUE = "#1976d2";
const LIGHT_GREY = "#f5f7fa";

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [batchTasks, setBatchTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState("students");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("batches");
  
  // Main table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog table pagination
  const [dialogPage, setDialogPage] = useState(0);
  const [dialogRowsPerPage, setDialogRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon, path: "/mentor/dashboard" },
    { id: "batches", label: "My Batches", icon: Group, path: "/mentor/batches" },
    { id: "create-task", label: "Create Task", icon: AddTask, path: "/mentor/create-task" },
    { id: "tasks", label: "Tasks", icon: Assignment, path: "/mentor/tasks" },
    { id: "weekly-review", label: "Weekly Review", icon: Assessment, path: "/mentor/weekly-review" },
    { id: "reviews", label: "My Reviews", icon: RateReview, path: "/mentor/reviews" },
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await API.get("/courses/mentor/batches/");
      setBatches(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDialogChangePage = (event, newPage) => {
    setDialogPage(newPage);
  };

  const handleDialogChangeRowsPerPage = (event) => {
    setDialogRowsPerPage(parseInt(event.target.value, 10));
    setDialogPage(0);
  };

  const paginatedBatches = batches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedDialogData = dialogContent === "students"
    ? batchStudents.slice(dialogPage * dialogRowsPerPage, dialogPage * dialogRowsPerPage + dialogRowsPerPage)
    : batchTasks.slice(dialogPage * dialogRowsPerPage, dialogPage * dialogRowsPerPage + dialogRowsPerPage);

  const handleViewStudents = async (batch) => {
    setSelectedBatch(batch);
    setDialogContent("students");
    setDialogPage(0);
    try {
      const response = await API.get(`/courses/batches/${batch.id}/students/`);
      setBatchStudents(response.data.students || []);
      setOpenDialog(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewTasks = async (batch) => {
    setSelectedBatch(batch);
    setDialogContent("tasks");
    setDialogPage(0);
    try {
      const response = await API.get(`/tasks/mentor/batch/${batch.id}/tasks/`);
      setBatchTasks(response.data);
      setOpenDialog(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
    setBatchStudents([]);
    setBatchTasks([]);
    setDialogPage(0);
  };

  const getInitials = (firstName, lastName) => (
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  );

  const Sidebar = () => (
    <Box
      sx={{
        width: sidebarOpen ? 220 : 70,
        height: "100vh",
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
            Mentor
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
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flex: 1,
            ml: sidebarOpen ? "220px" : "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            bgcolor: LIGHT_GREY,
          }}
        >
          <CircularProgress sx={{ color: BLUE }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", bgcolor: LIGHT_GREY, minHeight: "100vh" }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? "220px" : "70px", transition: "margin 0.25s ease" }}>
        <Container maxWidth="xl" sx={{ py: 5 }}>
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: "#fff",
              border: "1px solid #e0e0e0",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#222", mb: 1 }}>
                  My Batches
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Manage your assigned batches, students, and tasks
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: BLUE, mb: 0.5 }}>
                  {batches.length}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Total Batches
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Main Table */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0", overflow: "hidden" }}>
            {batches.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <People sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
                <Typography variant="h6" color="#555" sx={{ fontWeight: 600 }}>
                  No Batches Assigned
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You don't have any batches assigned yet
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Batch Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Course
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Students
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Duration
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBatches.map((batch) => (
                        <TableRow
                          key={batch.id}
                          hover
                          sx={{
                            "&:hover": { bgcolor: LIGHT_GREY },
                            transition: "background-color 0.2s",
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
                                {batch.course?.name || "No Course"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Group sx={{ fontSize: 16 }} />}
                              label={`${batch.student_count || 0}/${batch.max_students || "∞"}`}
                              size="small"
                              sx={{
                                bgcolor: LIGHT_GREY,
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
                              label={batch.is_active ? "Active" : "Inactive"}
                              size="small"
                              sx={{
                                bgcolor: batch.is_active ? BLUE : "#ccc",
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
                                    "&:hover": { bgcolor: BLUE, color: "#fff" },
                                  }}
                                >
                                  <Group fontSize="small" />
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
                                    "&:hover": { bgcolor: BLUE, color: "#fff" },
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
                                    "&:hover": { bgcolor: BLUE, color: "#fff" },
                                  }}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={batches.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{
                    borderTop: "1px solid #e0e0e0",
                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                      color: "#555",
                      fontWeight: 500,
                    },
                  }}
                />
              </>
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
        <DialogTitle
          sx={{
            bgcolor: BLUE,
            color: "white",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {dialogContent === "students" ? <Group /> : <Assignment />}
          {selectedBatch?.name} - {dialogContent === "students" ? "Students" : "Tasks"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 0 }}>
          {dialogContent === "students" ? (
            batchStudents.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Group sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                <Typography color="#555">
                  No students enrolled in this batch yet
                </Typography>
              </Box>
            ) : (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Student
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Contact
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Assigned
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Submitted
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                          Pending
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
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
                                  fontWeight: 700,
                                }}
                              >
                                {getInitials(student.first_name, student.last_name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {student.first_name} {student.last_name}
                                </Typography>
                                <Typography variant="caption" color="#555">
                                  @{student.username}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Email sx={{ fontSize: 14, color: BLUE }} />
                                <Typography variant="caption" color="#555">
                                  {student.email}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Phone sx={{ fontSize: 14, color: BLUE }} />
                                <Typography variant="caption" color="#555">
                                  {student.phone || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={student.total_assigned_tasks}
                              size="small"
                              sx={{ bgcolor: LIGHT_GREY, color: BLUE, fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={student.submitted_tasks}
                              size="small"
                              sx={{ bgcolor: "#0097A7", color: "#fff", fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={student.pending_tasks}
                              size="small"
                              sx={{ bgcolor: "#fbbc04", color: "#222", fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Student Profile">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  handleCloseDialog();
                                  navigate(
                                    `/mentor/batch/${selectedBatch.id}/student/${student.id}`
                                  );
                                }}
                                sx={{
                                  border: `1px solid ${BLUE}`,
                                  borderRadius: 1.5,
                                  color: BLUE,
                                  "&:hover": { bgcolor: BLUE, color: "#fff" },
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
                    borderTop: "1px solid #e0e0e0",
                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                      color: "#555",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            )
          ) : batchTasks.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Assignment sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
              <Typography color="#555">
                No tasks assigned to this batch yet
              </Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                        Task Title
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                        Description
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                        Due Date
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
                        Max Marks
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#555" }}>
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
                            color="#555"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
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
                            sx={{ bgcolor: LIGHT_GREY, color: BLUE, fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${task.submission_count || 0}`}
                            size="small"
                            sx={{ bgcolor: "#0097A7", color: "#fff", fontWeight: 700 }}
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
                  borderTop: "1px solid #e0e0e0",
                  ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                    color: "#555",
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
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
