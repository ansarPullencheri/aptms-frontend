import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Pending,
  Download,
  Grade,
  VisibilityOutlined,
} from '@mui/icons-material';

const BLUE = "#1565c0";
const LIGHT_BLUE = "#e3f2fd";
const GREEN = "#009688";

const StudentDetail = () => {
  // ✅ GET batchId from params
  const { batchId, studentId } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentSubmissions();
  }, [studentId]);

  const fetchStudentSubmissions = async () => {
    try {
      const response = await API.get(`/courses/students/${studentId}/submissions/`);
      setStudent(response.data.student);
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error fetching student submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      submitted: { label: 'Submitted', color: 'info' },
      graded: { label: 'Graded', color: 'success' },
      pending: { label: 'Pending', color: 'warning' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Student not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        Back to Batches
      </Button>

      {/* Student Info Card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: `1.5px solid ${LIGHT_BLUE}` }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: BLUE }}>
            {student.first_name?.[0]}{student.last_name?.[0]}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: BLUE }}>
              {student.first_name} {student.last_name}
            </Typography>
            <Typography color="textSecondary">
              @{student.username} • {student.email}
            </Typography>
          </Box>

          {/* ✅ VIEW PROGRESS BUTTON - Pass batchId correctly */}
          <Button
            variant="outlined"
            startIcon={<VisibilityOutlined />}
            onClick={() => navigate(`/mentor/student-progress/${batchId}/${studentId}`)}
            sx={{
              borderColor: GREEN,
              color: GREEN,
              borderRadius: 2,
              fontWeight: 700,
              '&:hover': { 
                bgcolor: GREEN, 
                color: '#fff',
                borderColor: GREEN 
              },
            }}
          >
            📋 View Progress
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="caption">
                  Total Submissions
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                  {submissions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="caption">
                  Graded
                </Typography>
                <Typography variant="h4" sx={{ color: GREEN, fontWeight: 700 }}>
                  {submissions.filter(s => s.status === 'graded').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="caption">
                  Pending Grading
                </Typography>
                <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                  {submissions.filter(s => s.status !== 'graded').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="caption">
                  Average Score
                </Typography>
                <Typography variant="h4" sx={{ color: BLUE, fontWeight: 700 }}>
                  {submissions.length > 0
                    ? Math.round(
                        submissions
                          .filter(s => s.marks_obtained !== null)
                          .reduce((sum, s) => sum + (s.marks_obtained / s.max_marks) * 100, 0) /
                          submissions.filter(s => s.marks_obtained !== null).length
                      )
                    : 0}
                  %
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Submissions Table */}
      <Paper sx={{ p: 3, borderRadius: 2, border: `1.5px solid ${LIGHT_BLUE}` }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: BLUE, mb: 2 }}>
          📝 Submitted Tasks
        </Typography>

        {submissions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              No submissions yet
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Task</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Submitted At</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Marks</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow 
                    key={submission.id} 
                    hover
                    sx={{
                      '&:hover': { bgcolor: LIGHT_BLUE },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {submission.task_title}
                      </Typography>
                    </TableCell>
                    <TableCell>{submission.course_name}</TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusChip(submission.status)}</TableCell>
                    <TableCell align="center">
                      {submission.marks_obtained !== null ? (
                        <Chip
                          label={`${submission.marks_obtained}/${submission.max_marks}`}
                          size="small"
                          sx={{
                            bgcolor: GREEN,
                            color: '#fff',
                            fontWeight: 700,
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          Not graded
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {submission.submission_file && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download />}
                            href={submission.submission_file}
                            target="_blank"
                            sx={{
                              borderColor: BLUE,
                              color: BLUE,
                              borderRadius: 1,
                              '&:hover': { bgcolor: LIGHT_BLUE }
                            }}
                          >
                            Download
                          </Button>
                        )}
                        {submission.status !== 'graded' && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Grade />}
                            onClick={() => navigate(`/mentor/review/${submission.id}`)}
                            sx={{
                              bgcolor: '#ff9800',
                              color: '#fff',
                              borderRadius: 1,
                              '&:hover': { bgcolor: '#e68900' }
                            }}
                          >
                            Grade
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default StudentDetail;
