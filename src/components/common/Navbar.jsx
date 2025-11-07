import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar,
  IconButton, Menu, MenuItem, Chip, Badge, Divider, Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Logout, Dashboard, School,
  Notifications, AccountCircle
} from '@mui/icons-material';

const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const getInitials = () =>
    !user
      ? 'U'
      : `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  const getRoleName = (role) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        borderRadius: 0,
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: '#fff',
          color: BLUE,
          boxShadow: '0 4px 14px rgba(21,101,192,0.06)',
          borderBottom: `1px solid ${LIGHT_BLUE}`,
        }}
      >
        <Toolbar sx={{ py: 1.2, px: 3 }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => navigate(user ? `/${user.role}/dashboard` : '/login')}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                background: LIGHT_BLUE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${BLUE}`,
              }}
            >
              <School sx={{ color: BLUE, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: BLUE,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                Tefora
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#223a5e',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                Software Solutions
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Notifications */}
              <IconButton
                onClick={handleNotifOpen}
                sx={{
                  color: BLUE,
                  background: LIGHT_BLUE,
                  '&:hover': { background: '#bbdefb' },
                  borderRadius: 2,
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* Profile */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  p: 0,
                  borderRadius: 2,
                  border: `1px solid ${LIGHT_BLUE}`,
                  transition: '0.3s',
                  '&:hover': { background: LIGHT_BLUE },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: BLUE,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {getInitials()}
                </Avatar>
              </IconButton>
            </Box>
          )}

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 240,
                borderRadius: 2,
                boxShadow: '0 8px 22px rgba(21,101,192,0.10)',
                border: `1px solid ${LIGHT_BLUE}`,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                background: LIGHT_BLUE,
                borderRadius: '8px 8px 0 0',
              }}
            >
              <Avatar sx={{ bgcolor: BLUE, color: '#fff' }}>
                {getInitials()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700} color={BLUE}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="caption" color="#223a5e">
                  {user?.email}
                </Typography>
                <Chip
                  label={getRoleName(user?.role)}
                  size="small"
                  sx={{
                    mt: 0.5,
                    background: '#fff',
                    color: BLUE,
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Box>

            <Divider />

            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate(`/${user.role}/dashboard`);
              }}
              sx={{ py: 1.2, gap: 2, color: BLUE }}
            >
              <Dashboard fontSize="small" />
              <Typography variant="body2">Dashboard</Typography>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{ py: 1.2, gap: 2, color: 'error.main', fontWeight: 700 }}
            >
              <Logout fontSize="small" />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleNotifClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 320,
                maxHeight: 480,
                borderRadius: 2,
                boxShadow: '0 8px 22px rgba(21,101,192,0.10)',
                border: `1px solid ${LIGHT_BLUE}`,
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: BLUE }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', color: BLUE }}
                >
                  Mark all read
                </Button>
              )}
            </Box>
            <Divider />
            {notifications.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Notifications sx={{ fontSize: 48, color: LIGHT_BLUE, mb: 1 }} />
                <Typography variant="body2" color={BLUE}>
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.link) navigate(notif.link);
                    handleNotifClose();
                  }}
                  sx={{
                    py: 1.2,
                    px: 2,
                    borderLeft: !notif.is_read
                      ? `3px solid ${BLUE}`
                      : '3px solid transparent',
                    background: !notif.is_read ? LIGHT_BLUE : 'transparent',
                    '&:hover': { background: '#bbdefb' },
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: !notif.is_read ? 700 : 400,
                        mb: 0.5,
                        color: BLUE,
                      }}
                    >
                      {notif.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', color: '#223a5e', lineHeight: 1.4 }}
                    >
                      {notif.message}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>
        </Toolbar>
      </AppBar>
    </Paper>
  );
};

export default Navbar;
