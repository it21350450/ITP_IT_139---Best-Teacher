import React, { useState } from 'react';
import { 
  Container, 
  Button, 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  ToggleButtonGroup,
  ToggleButton,
  Paper
} from '@mui/material';
import { School, Person, EventNote } from '@mui/icons-material';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingRequestForm from './components/bookings/BookingRequestForm';
import TeacherSelection from './components/bookings/TeacherSelection';
import { BookingProvider } from './context/BookingContext';

// Creating a custom premium theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee', // Modern vibrant blue
      light: '#4895ef',
    },
    secondary: {
      main: '#f72585', // Accent color
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2b2d42',
      secondary: '#6c757d',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 12, // Softer, modernized rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.2)',
          }
        }
      }
    }
  }
});

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [activeRole, setActiveRole] = useState(localStorage.getItem('mockRole') || 'student');

  React.useEffect(() => {
    if (!localStorage.getItem('mockRole')) {
       localStorage.setItem('mockRole', 'student');
    }
  }, []);

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setActiveRole(newRole);
      localStorage.setItem('mockRole', newRole);
      // Let's close the form if switching to teacher, as teachers don't request bookings in this scope
      if (newRole === 'teacher') {
        setShowForm(false);
        setSelectedTeacherId(null);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Top Navigation Bar */}
      <AppBar position="static" color="inherit" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0', mb: 4 }}>
        <Toolbar>
          <School color="primary" sx={{ fontSize: 32, mr: 1.5 }} />
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Best Teacher
          </Typography>
          
          {/* Mock Role Switcher (For demo UI purposes clearly) */}
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="textSecondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Viewing As:
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={activeRole}
              exclusive
              onChange={handleRoleChange}
              size="small"
              sx={{ bgcolor: 'white' }}
            >
              <ToggleButton value="student">
                <Person sx={{ mr: 1, fontSize: 18 }} /> Student
              </ToggleButton>
              <ToggleButton value="teacher">
                <School sx={{ mr: 1, fontSize: 18 }} /> Teacher
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Toolbar>
      </AppBar>

      <BookingProvider>
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          
          {/* Interactive Header based on role */}
          <Box mb={4} display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gap={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
                {activeRole === 'student' ? 'My Learning Schedule' : 'Teacher Dashboard'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {activeRole === 'student' 
                  ? 'Manage your requested lessons or book a new session with a teacher.' 
                  : 'Manage incoming lesson requests from students.'}
              </Typography>
            </Box>

            {/* Main Action Button */}
            {activeRole === 'student' && (
              <Button 
                variant={showForm ? "outlined" : "contained"} 
                color="primary"
                size="large"
                startIcon={<EventNote />}
                onClick={() => {
                  if (showForm) {
                    setShowForm(false);
                    setSelectedTeacherId(null);
                  } else {
                    setShowForm(true);
                  }
                }}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                {showForm ? 'Cancel Request' : 'Book a Lesson'}
              </Button>
            )}
          </Box>

          {/* Conditional UI */}
          {showForm && activeRole === 'student' ? (
            <Box mb={6} sx={{ animation: 'fadeIn 0.4s ease-in' }}>
              {!selectedTeacherId ? (
                <TeacherSelection onSelectTeacher={id => setSelectedTeacherId(id)} />
              ) : (
                <BookingRequestForm 
                  teacherId={selectedTeacherId}
                  onClose={() => {
                    setShowForm(false);
                    setSelectedTeacherId(null);
                  }} 
                  onBack={() => setSelectedTeacherId(null)}
                />
              )}
            </Box>
          ) : null}

          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid #eaeaea', borderRadius: 4, bgcolor: '#ffffff' }}>
             <MyBookingsPage injectedRole={activeRole} />
          </Paper>

        </Container>
      </BookingProvider>
    </ThemeProvider>
  );
}

export default App;
