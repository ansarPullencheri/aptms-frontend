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
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Pending,
  Download,
  Grade,
} from '@mui/icons-material';

const StudentDetail = () => {
  const { studentId } = useParams();
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
        sx={{ mb: 2 }}
      >
        Back to Batches
      </Button>

      {/* Student Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            {student.first_name?.[0]}{student.last_name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h4">
              {student.first_name} {student.last_name}
            </Typography>
            <Typography color="textSecondary">
              @{student.username} • {student.email}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Submissions
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {submissions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Graded
                </Typography>
                <Typography variant="h4" color="success.main">
                  {submissions.filter(s => s.status === 'graded').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Grading
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {submissions.filter(s => s.status !== 'graded').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Submissions Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Submitted Tasks
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
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Submitted At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Marks</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id} hover>
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
                          color="success"
                        />
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          Not graded
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {submission.submission_file && (
                        <Button
                          size="small"
                          startIcon={<Download />}
                          href={submission.submission_file}
                          target="_blank"
                        >
                          Download
                        </Button>
                      )}
                      {submission.status !== 'graded' && (
                        <Button
                          size="small"
                          color="warning"
                          startIcon={<Grade />}
                          onClick={() => navigate(`/mentor/grade-submission/${submission.id}`)}
                          sx={{ ml: 1 }}
                        >
                          Grade
                        </Button>
                      )}
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
