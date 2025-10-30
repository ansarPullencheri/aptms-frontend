import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

import {
  Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Alert, Box, Tabs, Tab,
  Grid, Divider, Avatar, Badge, List, ListItemButton, ListItemIcon, ListItemText,
  CircularProgress, TablePagination, Tooltip, InputAdornment, Menu
} from '@mui/material';
import {
  Edit, Delete, PersonAdd, CheckCircle, Cancel, Email, Phone, CalendarToday,
  School, Refresh, Dashboard as DashboardIcon, People, Assignment, Task, Menu as MenuIcon, Close,
  VpnKey, Visibility, VisibilityOff, ContentCopy, AutoAwesome, MoreVert
} from '@mui/icons-material';

const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';
const GREEN = '#00897b';

const getRoleName = (role) => role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
const getInitials = (firstName, lastName) =>
  `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

// Sidebar Component
const Sidebar = ({ sidebarOpen, setSidebarOpen, activeNav, setActiveNav, navigate, pendingCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'students', label: 'Manage Users', icon: People, path: '/admin/manage-users' },
    { id: 'mentors', label: 'Mentors', icon: School, path: '/admin/create-mentor' },
    { id: 'courses', label: 'Courses', icon: Assignment, path: '/admin/manage-courses' },
    { id: 'batches', label: 'Batches', icon: School, path: '/admin/manage-batches' },
    { id: 'tasks', label: 'Tasks', icon: Task, path: '/admin/manage-tasks' },
    { id: 'approvals', label: 'Approvals', icon: PersonAdd, path: '/admin/student-approval', badge: pendingCount }
  ];

  return (
    <Box sx={{
      width: sidebarOpen ? 220 : 70,
      height: 'calc(100vh - 64px)',
      bgcolor: '#fff',
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
      p: 0
    }}>
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
                color: isActive ? '#fff' : BLUE,
                background: isActive ? BLUE : 'transparent',
                mb: 0.5,
                '&:hover': { background: LIGHT_BLUE },
                px: 2,
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#fff' : BLUE, minWidth: 40 }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#fff' : BLUE,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

// Password Reset Dialog Component
const ResetPasswordDialog = ({ open, onClose, user, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleReset = () => {
    setNewPassword('');
    setGeneratedPassword('');
    setMessage(null);
    setShowPassword(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleGeneratePassword = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await API.post('/auth/admin/generate-password/', {
        user_id: user.id
      });

      setGeneratedPassword(response.data.new_password);
      setMessage({
        type: 'success',
        text: 'Password generated successfully! Copy it and share with the user.'
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to generate password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      await API.post('/auth/admin/reset-password/', {
        user_id: user.id,
        new_password: newPassword
      });

      setMessage({
        type: 'success',
        text: 'Password reset successfully!'
      });

      if (onSuccess) onSuccess();

      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to reset password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setMessage({
      type: 'success',
      text: 'Password copied to clipboard!'
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: BLUE, color: '#fff', fontWeight: 700 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <VpnKey />
          Reset Password
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3, p: 2, bgcolor: LIGHT_BLUE, borderRadius: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>User:</strong> {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Username:</strong> {user.username}
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> {user.email}
          </Typography>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ mb: 3, p: 2, border: '2px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: BLUE }}>
            Option 1: Generate Random Password
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            System will generate a secure 8-character password
          </Typography>

          {generatedPassword && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', flex: 1 }}>
                {generatedPassword}
              </Typography>
              <Tooltip title="Copy password">
                <IconButton onClick={handleCopyPassword} size="small" sx={{ color: BLUE }}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={handleGeneratePassword}
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: GREEN,
              fontWeight: 600,
              '&:hover': { bgcolor: '#00695c' }
            }}
          >
            {generatedPassword ? 'Generate New' : 'Generate Password'}
          </Button>
        </Box>

        <Box sx={{ p: 2, border: '2px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: BLUE }}>
            Option 2: Set Custom Password
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter a password manually (min 6 characters)
          </Typography>

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleManualReset}
            disabled={loading || !newPassword}
            sx={{
              mt: 2,
              bgcolor: BLUE,
              fontWeight: 600,
              '&:hover': { bgcolor: '#003c8f' }
            }}
          >
            Set Password
          </Button>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Important:</strong> Make sure to share the new password with the user securely.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const ManageUsers = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('students');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '', phone: '',
    role: 'student', is_approved: true
  });

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { 
    filterUsersByRole(tabValue);
    setPage(0);
  }, [tabValue, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/users/');
      setUsers(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: "Failed to fetch users" });
    } finally { setLoading(false); }
  };

  const filterUsersByRole = (tab) => {
    let filtered;
    switch (tab) {
      case 0: filtered = users; break;
      case 1: filtered = users.filter(u => u.role === 'student'); break;
      case 2: filtered = users.filter(u => u.role === 'mentor'); break;
      case 3: filtered = users.filter(u => u.role === 'admin'); break;
      default: filtered = users;
    }
    setFilteredUsers(filtered);
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleMenuClick = (event, user) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_approved: user.is_approved
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '', email: '', first_name: '', last_name: '', phone: '',
        role: 'student', is_approved: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleViewDetails = (user) => {
    setViewingUser(user);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setViewingUser(null);
  };

  const handleOpenResetPassword = (user) => {
    setResetPasswordUser(user);
    setResetDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await API.put(`/auth/users/${editingUser.id}/`, formData);
        setMessage({ type: 'success', text: "User updated successfully" });
      } else {
        await API.post(`/auth/users/create/`, formData);
        setMessage({ type: 'success', text: "User created successfully" });
      }
      fetchUsers();
      handleCloseDialog();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || "Error saving user" });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) return;
    try {
      await API.delete(`/auth/users/${userId}/`);
      setMessage({ type: 'success', text: "User deleted successfully" });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || "Error deleting user" });
    }
  };

  const handleToggleApproval = async (userId, currentStatus, username) => {
    try {
      await API.patch(`/auth/users/${userId}/`, { is_approved: !currentStatus });
      setMessage({ type: 'success', text: `${username} ${!currentStatus ? "approved" : "disapproved"} successfully` });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: "Error updating approval status" });
    }
  };

  const pendingCount = users.filter(u => !u.is_approved).length;

  return (
    <Box sx={{ display: 'flex', bgcolor: LIGHT_BLUE, minHeight: '100vh', pt: '64px' }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        navigate={navigate}
        pendingCount={pendingCount}
      />
      <Box sx={{ flex: 1, ml: sidebarOpen ? '220px' : '70px', transition: 'margin-left 0.2s' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper elevation={0} sx={{
            p: 3, mb: 4, borderRadius: 3, bgcolor: '#fff', border: `1.5px solid ${LIGHT_BLUE}`
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: BLUE }}>
                  Manage Users
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View, edit, and manage all system users
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers}
                  sx={{ borderColor: BLUE, color: BLUE, borderRadius: 2, '&:hover': { bgcolor: LIGHT_BLUE } }}>
                  Refresh
                </Button>
                <Button variant="contained" startIcon={<PersonAdd />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    bgcolor: BLUE, color: '#fff', px: 3, py: 1.5,
                    borderRadius: 2, fontWeight: 600,
                    '&:hover': { bgcolor: '#003c8f' }, transition: 'all 0.3s',
                  }}>
                  Add New User
                </Button>
              </Box>
            </Box>
          </Paper>

          {message.text && (
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
              <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                {message.text}
              </Alert>
            </Paper>
          )}

          <Paper elevation={0} sx={{ borderRadius: 3, border: `1.5px solid ${LIGHT_BLUE}` }}>
            <Tabs value={tabValue} onChange={handleTabChange}
              sx={{ borderBottom: `1px solid ${LIGHT_BLUE}` }}>
              <Tab label={`All Users (${users.length})`} />
              <Tab label={`Students (${users.filter(u => u.role === 'student').length})`} />
              <Tab label={`Mentors (${users.filter(u => u.role === 'mentor').length})`} />
              <Tab label={`Admins (${users.filter(u => u.role === 'admin').length})`} />
            </Tabs>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: LIGHT_BLUE }}>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <People sx={{ fontSize: 64, color: '#90caf9', mb: 2 }} />
                        <Typography variant="body1" color={BLUE}>
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map(user => (
                      <TableRow key={user.id} hover
                        onClick={() => handleViewDetails(user)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: LIGHT_BLUE },
                          transition: 'background-color 0.2s',
                        }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: BLUE, width: 40, height: 40, fontWeight: 700 }}>
                              {getInitials(user.first_name, user.last_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {user.first_name} {user.last_name}
                              </Typography>
                              <Typography variant="caption" color="#223a5e">
                                {user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email sx={{ fontSize: 16, color: BLUE }} />
                            {user.email}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 16, color: BLUE }} />
                            {user.phone || 'NA'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleName(user.role)}
                            size="small"
                            sx={{
                              background: LIGHT_BLUE,
                              color: BLUE,
                              fontWeight: 700,
                            }} />
                        </TableCell>
                        <TableCell>
                          {user.is_approved ?
                            <Chip label="Approved" size="small"
                              sx={{ background: LIGHT_BLUE, color: BLUE, fontWeight: 700 }} /> :
                            <Chip label="Pending" size="small"
                              sx={{ background: "#fff0f0", color: "#d32f2f", fontWeight: 700 }} />}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 16, color: BLUE }} />
                            {new Date(user.date_joined).toLocaleDateString()}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, user)}
                            sx={{ color: BLUE }}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredUsers.length}
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
          </Paper>

          {/* Actions Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                mt: 1,
                minWidth: 200
              }
            }}
          >
            <MenuItem
              onClick={() => {
                handleOpenResetPassword(selectedUser);
                handleMenuClose();
              }}
              sx={{ gap: 2, color: '#ff9800', '&:hover': { bgcolor: '#fff3e0' } }}
            >
              <VpnKey fontSize="small" />
              Reset Password
            </MenuItem>
            
            <MenuItem
              onClick={() => {
                handleOpenDialog(selectedUser);
                handleMenuClose();
              }}
              sx={{ gap: 2, color: BLUE, '&:hover': { bgcolor: LIGHT_BLUE } }}
            >
              <Edit fontSize="small" />
              Edit User
            </MenuItem>
            
            <MenuItem
              onClick={() => {
                handleToggleApproval(selectedUser.id, selectedUser.is_approved, selectedUser.username);
                handleMenuClose();
              }}
              sx={{ gap: 2, color: selectedUser?.is_approved ? "#d32f2f" : BLUE, '&:hover': { bgcolor: LIGHT_BLUE } }}
            >
              {selectedUser?.is_approved ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
              {selectedUser?.is_approved ? 'Disapprove' : 'Approve'}
            </MenuItem>
            
            <Divider />
            
            <MenuItem
              onClick={() => {
                handleDeleteUser(selectedUser.id, selectedUser.username);
                handleMenuClose();
              }}
              sx={{ gap: 2, color: "#d32f2f", '&:hover': { bgcolor: "#fff0f0" } }}
            >
              <Delete fontSize="small" />
              Delete User
            </MenuItem>
          </Menu>

          {/* User Details Dialog */}
          <Dialog
            open={openDetailsDialog}
            onClose={handleCloseDetailsDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{
              bgcolor: BLUE, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 1,
            }}>
              <Avatar sx={{ bgcolor: '#fff', color: BLUE, mr: 1 }}>
                <PersonAdd />
              </Avatar>
              User Details
            </DialogTitle>
            <DialogContent>
              {viewingUser ? (
                <Box sx={{ pt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: BLUE, width: 60, height: 60, fontSize: "1.5rem", fontWeight: 700 }}>
                          {getInitials(viewingUser.first_name, viewingUser.last_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{viewingUser.first_name} {viewingUser.last_name}</Typography>
                          <Typography variant="body2" color="#223a5e">
                            {viewingUser.username}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2"><strong>Email:</strong> {viewingUser.email}</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {viewingUser.phone || "Not provided"}</Typography>
                      <Typography variant="body2"><strong>Role:</strong> {getRoleName(viewingUser.role)}</Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> {viewingUser.is_approved ? "Approved" : "Pending Approval"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Joined:</strong> {new Date(viewingUser.date_joined).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>)}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDetailsDialog} sx={{ borderRadius: 2 }}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Add/Edit User Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ bgcolor: BLUE, color: "#fff", fontWeight: 700 }}>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <TextField fullWidth label="Username" value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  sx={{ mb: 2, '.MuiOutlinedInput-root': { borderRadius: 2 } }}
                  required disabled={!!editingUser} />
                <TextField fullWidth label="Email" type="email" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  sx={{ mb: 2, '.MuiOutlinedInput-root': { borderRadius: 2 } }} required />
                <TextField fullWidth label="First Name" value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  sx={{ mb: 2, '.MuiOutlinedInput-root': { borderRadius: 2 } }} required />
                <TextField fullWidth label="Last Name" value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  sx={{ mb: 2, '.MuiOutlinedInput-root': { borderRadius: 2 } }} required />
                <TextField fullWidth label="Phone" value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  sx={{ mb: 2, '.MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    label="Role"
                    sx={{ borderRadius: 2 }}>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="mentor">Mentor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.is_approved}
                    onChange={e => setFormData({ ...formData, is_approved: e.target.value })}
                    label="Status"
                    sx={{ borderRadius: 2 }}>
                    <MenuItem value={true}>Approved</MenuItem>
                    <MenuItem value={false}>Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>Cancel</Button>
              <Button onClick={handleSaveUser} variant="contained"
                sx={{ bgcolor: BLUE, color: "#fff", borderRadius: 2, px: 3 }}>
                {editingUser ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Password Reset Dialog */}
          <ResetPasswordDialog
            open={resetDialogOpen}
            onClose={() => {
              setResetDialogOpen(false);
              setResetPasswordUser(null);
            }}
            user={resetPasswordUser}
            onSuccess={() => {
              setMessage({ type: 'success', text: 'Password reset successful' });
              setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }}
          />
        </Container>
      </Box>
    </Box>
  );
};

export default ManageUsers;
