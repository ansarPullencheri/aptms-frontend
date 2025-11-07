import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Group,
  Assignment,
  Schedule,
  School,
  Menu as MenuIcon,
  Close,
  GradeOutlined,
  AddTask,
  Visibility,
  CalendarToday,
  Assessment,
  RateReview,
} from "@mui/icons-material";

const BLUE = "#1976d2";
const LIGHT_GREY = "#f5f7fa";

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
  const [activeNav, setActiveNav] = useState("dashboard");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const batchResponse = await API.get("/courses/mentor/batches/");
      setBatches(batchResponse.data);
      const totalStudents = batchResponse.data.reduce(
        (sum, batch) => sum + (batch.student_count || 0),
        0
      );
      setStats({
        totalBatches: batchResponse.data.length,
        totalStudents: totalStudents,
        totalTasks: 0,
        pendingGrading: 0,
      });
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

  const paginatedBatches = batches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon, path: "/mentor/dashboard" },
    { id: "batches", label: "My Batches", icon: Group, path: "/mentor/batches" },
    { id: "create-task", label: "Create Task", icon: AddTask, path: "/mentor/create-task" },
    { id: "tasks", label: "Tasks", icon: Assignment, path: "/mentor/tasks" },
    { id: "weekly-review", label: "Weekly Review", icon: Assessment, path: "/mentor/weekly-review" },
    { id: "my-reviews", label: "My Reviews", icon: RateReview, path: "/mentor/reviews" },
  ];

  const statCards = [
    { title: "My Batches", value: stats.totalBatches, icon: Group },
    { title: "Total Students", value: stats.totalStudents, icon: School },
    { title: "Tasks Assigned", value: stats.totalTasks, icon: Assignment },
    { title: "Pending Grading", value: stats.pendingGrading, icon: Schedule },
  ];

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
    <Box sx={{ display: "flex", bgcolor: LIGHT_GREY, minHeight: "100vh" }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? "220px" : "70px", transition: "margin 0.25s ease" }}>
        <Container maxWidth="xl" sx={{ py: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#222", mb: 4 }}>
            Welcome Back, Mentor 👋
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
                      <Box>
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

          {/* Table */}
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
                Assigned Batches
              </Typography>
            </Box>

            {batches.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Group sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                <Typography variant="h6" color="#555">
                  No Batches Assigned
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: LIGHT_GREY }}>
                        {["Batch", "Course", "Students", "Duration", "Status", "Actions"].map(
                          (head) => (
                            <TableCell key={head} sx={{ fontWeight: 700, color: "#555" }}>
                              {head}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBatches.map((batch) => (
                        <TableRow key={batch.id} hover>
                          <TableCell>{batch.name}</TableCell>
                          <TableCell>{batch.course?.name || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${batch.student_count || 0}/${batch.max_students}`}
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
                              {new Date(batch.start_date).toLocaleDateString()} –{" "}
                              {new Date(batch.end_date).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={batch.is_active ? "Active" : "Inactive"}
                              size="small"
                              sx={{
                                bgcolor: batch.is_active ? BLUE : "#ccc",
                                color: "#fff",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate("/mentor/batches")}
                                sx={{ color: BLUE }}
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
                  count={batches.length}
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

export default MentorDashboard;
