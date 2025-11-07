import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  OutlinedInput,
  Checkbox,
  FormControlLabel,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Switch,
  Card,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  ArrowBack,
  School,
  Dashboard as DashboardIcon,
  People,
  Assignment,
  GradeOutlined,
  Menu as MenuIcon,
  Close,
  CalendarToday,
  Grade,
  RateReview,
  AssignmentTurnedIn,
  Assessment,
} from "@mui/icons-material";

const BLUE = "#1976d2";
const LIGHT_GREY = "#f5f7fa";

const MentorCreateTask = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [assignToAll, setAssignToAll] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("create-task");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    batch_id: "",
    assigned_to_ids: [],
    due_date: "",
    max_marks: 100,
    task_order: 0,
    week_number: 1,
    is_scheduled: false,
    release_date: "",
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon, path: "/mentor/dashboard" },
    { id: "batches", label: "My Batches", icon: People, path: "/mentor/batches" },
    { id: "create-task", label: "Create Task", icon: Add, path: "/mentor/create-task" },
    { id: "tasks", label: "Tasks", icon: Assignment, path: "/mentor/tasks" },
    { id: "weekly-review", label: "Weekly Review", icon: Assessment, path: "/mentor/weekly-review" },
    { id: "reviews", label: "My Reviews", icon: RateReview, path: "/mentor/reviews" },
  ];

  useEffect(() => {
    fetchMentorBatches();
  }, []);

  useEffect(() => {
    if (formData.batch_id) fetchBatchStudents(formData.batch_id);
  }, [formData.batch_id]);

  const fetchMentorBatches = async () => {
    try {
      const response = await API.get("/courses/mentor/batches/");
      setBatches(response.data);
      const uniqueCourses = [
        ...new Map(response.data.map((batch) => [batch.course.id, batch.course])).values(),
      ];
      setCourses(uniqueCourses);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch your batches" });
    }
  };

  const fetchBatchStudents = async (batchId) => {
    try {
      const response = await API.get(`/courses/batches/${batchId}/students/`);
      setStudents(response.data.students || []);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch students" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        assigned_to_ids: assignToAll ? [] : formData.assigned_to_ids,
        release_date: formData.is_scheduled ? formData.release_date : null,
      };
      const response = await API.post("/tasks/mentor/create/", submitData);
      setMessage({
        type: "success",
        text: response.data.message || "Task created successfully!",
      });
      setFormData({
        title: "",
        description: "",
        batch_id: "",
        assigned_to_ids: [],
        due_date: "",
        max_marks: 100,
        task_order: 0,
        week_number: 1,
        is_scheduled: false,
        release_date: "",
      });
      setAssignToAll(true);
      setStudents([]);
      setTimeout(() => {
        navigate("/mentor/tasks");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Error creating task",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const selectedBatch = batches.find((b) => b.id === formData.batch_id);

  return (
    <Box sx={{ display: "flex", bgcolor: LIGHT_GREY, minHeight: "100vh" }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: sidebarOpen ? "220px" : "70px", transition: "margin 0.25s ease" }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/mentor/batches")}
            sx={{
              mb: 3,
              borderRadius: 2,
              color: BLUE,
              "&:hover": { bgcolor: "#e3f2fd" },
            }}
          >
            Back to Batches
          </Button>

         

          {/* Messages */}
          {message.text && (
            <Alert
              severity={message.type}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          )}

          {/* Form */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Task Title */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#222", mb: 2 }}>
                      Task Details
                    </Typography>
                    <TextField
                      fullWidth
                      label="Task Title"
                      placeholder="Enter task title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      placeholder="Enter detailed task description..."
                      multiline
                      rows={5}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* Batch Selection */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#222", mb: 2 }}>
                      Assign To
                    </Typography>
                    <FormControl fullWidth required>
                      <InputLabel>Select Batch</InputLabel>
                      <Select
                        value={formData.batch_id}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            batch_id: e.target.value,
                            assigned_to_ids: [],
                          });
                        }}
                        label="Select Batch"
                        sx={{ borderRadius: 2 }}
                      >
                        {batches.length === 0 ? (
                          <MenuItem disabled>No batches available</MenuItem>
                        ) : (
                          batches.map((batch) => (
                            <MenuItem key={batch.id} value={batch.id}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <People sx={{ fontSize: 18, color: BLUE }} />
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {batch.name}
                                  </Typography>
                                  <Typography variant="caption" color="#666">
                                    {batch.course.name} • {batch.student_count || 0} students
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Assign to All / Specific Students */}
                  <Grid item xs={12}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#f5f7fa",
                        border: `1px solid #e0e0e0`,
                        borderRadius: 2,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={assignToAll}
                            onChange={(e) => {
                              setAssignToAll(e.target.checked);
                              if (e.target.checked)
                                setFormData({ ...formData, assigned_to_ids: [] });
                            }}
                            disabled={!formData.batch_id}
                            sx={{ color: BLUE }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: "#222" }}>
                              Assign to all students
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formData.batch_id && selectedBatch
                                ? `${selectedBatch.student_count || 0} students in this batch`
                                : "Select a batch first"}
                            </Typography>
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>

                  {/* Specific Students */}
                  {!assignToAll && (
                    <Grid item xs={12}>
                      <FormControl fullWidth required disabled={!formData.batch_id}>
                        <InputLabel>Select Specific Students</InputLabel>
                        <Select
                          multiple
                          value={formData.assigned_to_ids}
                          onChange={(e) =>
                            setFormData({ ...formData, assigned_to_ids: e.target.value })
                          }
                          input={<OutlinedInput label="Select Specific Students" />}
                          sx={{ borderRadius: 2 }}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => {
                                const student = students.find((s) => s.id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={`${student?.first_name} ${student?.last_name}`}
                                    size="small"
                                    sx={{
                                      bgcolor: BLUE,
                                      color: "#fff",
                                      fontWeight: 700,
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {students
                            .filter((s) => s.is_approved)
                            .map((student) => (
                              <MenuItem key={student.id} value={student.id}>
                                <Checkbox
                                  checked={formData.assigned_to_ids.indexOf(student.id) > -1}
                                  sx={{ color: BLUE }}
                                />
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: BLUE,
                                    color: "#fff",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    mr: 1.5,
                                  }}
                                >
                                  {student.first_name?.[0]}{student.last_name?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: "#222" }}>
                                    {student.first_name} {student.last_name}
                                  </Typography>
                                  <Typography variant="caption" color="#666">
                                    @{student.username}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* Scheduling & Marks */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#222", mb: 2 }}>
                      Schedule & Grading
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Week Number"
                      value={formData.week_number}
                      onChange={(e) =>
                        setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })
                      }
                      inputProps={{ min: 1, max: 52 }}
                      helperText="Course week (1-52)"
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Task Order"
                      value={formData.task_order}
                      onChange={(e) =>
                        setFormData({ ...formData, task_order: parseInt(e.target.value) || 0 })
                      }
                      inputProps={{ min: 0 }}
                      helperText="Order within the week"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Due Date & Time"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Maximum Marks"
                      type="number"
                      value={formData.max_marks}
                      onChange={(e) =>
                        setFormData({ ...formData, max_marks: parseInt(e.target.value) || 0 })
                      }
                      inputProps={{ min: 1, max: 1000 }}
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  {/* Scheduling */}
                  <Grid item xs={12}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#f5f7fa",
                        border: `1px solid #e0e0e0`,
                        borderRadius: 2,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.is_scheduled}
                            onChange={(e) =>
                              setFormData({ ...formData, is_scheduled: e.target.checked })
                            }
                            sx={{ color: BLUE }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: "#222" }}>
                              Schedule Release Date
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formData.is_scheduled
                                ? "Task will be released on the scheduled date"
                                : "Task will be immediately available"}
                            </Typography>
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>

                  {formData.is_scheduled && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="datetime-local"
                        label="Release Date & Time"
                        value={formData.release_date}
                        onChange={(e) =>
                          setFormData({ ...formData, release_date: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* Preview */}
                  {formData.title && (
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#222", mb: 2 }}>
                        Preview
                      </Typography>
                      <Card
                        elevation={0}
                        sx={{
                          p: 3,
                          bgcolor: "#f5f7fa",
                          border: `2px dashed ${BLUE}`,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: BLUE, mb: 1 }}
                        >
                          {formData.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#555"
                          sx={{ mb: 2, whiteSpace: "pre-wrap" }}
                        >
                          {formData.description || "No description"}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip
                            label={`Week ${formData.week_number}`}
                            size="small"
                            sx={{ bgcolor: BLUE, color: "#fff", fontWeight: 700 }}
                          />
                          {formData.due_date && (
                            <Chip
                              icon={<CalendarToday sx={{ fontSize: 16 }} />}
                              label={`Due: ${new Date(formData.due_date).toLocaleString()}`}
                              size="small"
                              sx={{ bgcolor: "#D84315", color: "#fff", fontWeight: 700 }}
                            />
                          )}
                          <Chip
                            icon={<Grade sx={{ fontSize: 16 }} />}
                            label={`${formData.max_marks} Marks`}
                            size="small"
                            sx={{ bgcolor: "#0097A7", color: "#fff", fontWeight: 700 }}
                          />
                          {selectedBatch && (
                            <Chip
                              icon={<People sx={{ fontSize: 16 }} />}
                              label={selectedBatch.name}
                              size="small"
                              sx={{ bgcolor: BLUE, color: "#fff", fontWeight: 700 }}
                            />
                          )}
                          {!assignToAll && formData.assigned_to_ids.length > 0 && (
                            <Chip
                              icon={<AssignmentTurnedIn sx={{ fontSize: 16 }} />}
                              label={`${formData.assigned_to_ids.length} student${
                                formData.assigned_to_ids.length !== 1 ? "s" : ""
                              }`}
                              size="small"
                              sx={{ bgcolor: "#43A047", color: "#fff", fontWeight: 700 }}
                            />
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  )}

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      fullWidth
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: BLUE,
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#fff",
                        "&:hover": { bgcolor: "#1565c0", transform: "scale(1.01)" },
                        transition: "all 0.3s",
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: "#fff" }} />
                          Creating Task...
                        </>
                      ) : (
                        "Create Task"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default MentorCreateTask;
