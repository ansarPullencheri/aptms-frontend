import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar,
  IconButton, Menu, MenuItem, Chip, Badge, Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Logout, Dashboard, School,
  Person, Notifications, Settings, AccountCircle
} from '@mui/icons-material';

const BLUE = '#1565c0';
const LIGHT_BLUE = '#e3f2fd';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotifOpen = (event) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const getRoleName = (role) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  const getInitials = () =>
    !user
      ? 'U'
      : `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  // Nav items (can be extended later)
  const adminNavItems = [];
  const mentorNavItems = [];
  const studentNavItems = [];
  const getNavItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return adminNavItems;
      case 'mentor':
        return mentorNavItems;
      case 'student':
        return studentNavItems;
      default:
        return [];
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        background: '#fff',
        color: BLUE,
        borderBottom: `2px solid ${LIGHT_BLUE}`,
        zIndex: 1100,
        top: 0,
        boxShadow: '0 1px 8px rgba(21,101,192,0.06)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: LIGHT_BLUE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              cursor: 'pointer',
              border: `1.5px solid ${BLUE}`,
            }}
            onClick={() => navigate(user ? `/${user.role}/dashboard` : '/login')}
          >
            <School sx={{ color: BLUE, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: BLUE,
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                cursor: 'pointer',
              }}
              onClick={() =>
                navigate(user ? `/${user.role}/dashboard` : '/login')
              }
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

        {/* Navigation Items */}
        {user && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
            {getNavItems().map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  onClick={() => navigate(item.path)}
                  startIcon={<Icon sx={{ fontSize: 18, color: BLUE }} />}
                  sx={{
                    color: BLUE,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: 'transparent',
                    '&:hover': {
                      background: LIGHT_BLUE,
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

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

            {/* Profile Button */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: BLUE,
                background: LIGHT_BLUE,
                '&:hover': { background: '#bbdefb' },
                borderRadius: 2,
                p: 0.7,
              }}
            >
              <AccountCircle sx={{ fontSize: 30 }} />
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
              boxShadow: '0 6px 22px rgba(21,101,192,0.10)',
              border: `1px solid ${LIGHT_BLUE}`,
              bgcolor: '#fff',
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
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: BLUE,
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {getInitials()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: BLUE }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#223a5e' }}>
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

          {/* <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate('/profile');
            }}
            sx={{ py: 1.2, gap: 2, color: BLUE }}
          >
            <Person fontSize="small" />
            <Typography variant="body2">My Profile</Typography>
          </MenuItem> */}

          {/* <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate('/settings');
            }}
            sx={{ py: 1.2, gap: 2, color: BLUE }}
          >
            <Settings fontSize="small" />
            <Typography variant="body2">Settings</Typography>
          </MenuItem> */}

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
              maxWidth: 400,
              maxHeight: 500,
              borderRadius: 2,
              boxShadow: '0 6px 22px rgba(21,101,192,0.10)',
              border: `1px solid ${LIGHT_BLUE}`,
              bgcolor: '#fff',
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
                onClick={() => {
                  markAllAsRead();
                }}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  color: BLUE,
                }}
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
            [
              ...notifications.slice(0, 5).map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.link) {
                      navigate(notif.link);
                    }
                    handleNotifClose();
                  }}
                  sx={{
                    py: 1.3,
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
                      sx={{
                        display: 'block',
                        mb: 0.5,
                        lineHeight: 1.4,
                        color: '#223a5e',
                      }}
                    >
                      {notif.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.7rem', color: '#90caf9' }}
                    >
                      {notif.time_ago} • {notif.sender_name}
                    </Typography>
                  </Box>
                  {!notif.is_read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: BLUE,
                        mt: 0.5,
                        ml: 1,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </MenuItem>
              )),
              notifications.length > 5 && <Divider key="divider" />,
              notifications.length > 5 && (
                <MenuItem
                  key="view-all"
                  onClick={() => {
                    navigate('/notifications');
                    handleNotifClose();
                  }}
                  sx={{
                    py: 1.2,
                    justifyContent: 'center',
                    color: BLUE,
                    fontWeight: 700,
                  }}
                >
                  View all notifications
                </MenuItem>
              ),
            ].filter(Boolean)
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
