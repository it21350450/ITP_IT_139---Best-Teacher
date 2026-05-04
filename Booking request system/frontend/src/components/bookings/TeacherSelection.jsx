import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person } from '@mui/icons-material';

const TeacherSelection = ({ onSelectTeacher }) => {
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({ subjects: [], modules: [] });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, [selectedSubject, selectedModule]);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/teachers?';
      if (selectedSubject) url += `subject=${encodeURIComponent(selectedSubject)}&`;
      if (selectedModule) url += `module=${encodeURIComponent(selectedModule)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setTeachers(data.data);
        if (data.filters) {
          // Keep the existing filters if the API doesn't return them or only returns filtered subset
          // In our API we always return all unique filters regardless of query
          setFilters(data.filters);
        }
      } else {
        setError(data.message || 'Failed to fetch teachers');
      }
    } catch (err) {
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Select a Teacher
      </Typography>
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter by Subject</InputLabel>
          <Select
            value={selectedSubject}
            label="Filter by Subject"
            onChange={(e) => setSelectedSubject(e.target.value)}
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value=""><em>All Subjects</em></MenuItem>
            {filters.subjects.map(subject => (
              <MenuItem key={subject} value={subject}>{subject}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter by Module</InputLabel>
          <Select
            value={selectedModule}
            label="Filter by Module"
            onChange={(e) => setSelectedModule(e.target.value)}
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value=""><em>All Modules</em></MenuItem>
            {filters.modules.map(module => (
              <MenuItem key={module} value={module}>{module}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : teachers.length === 0 ? (
        <Alert severity="info">No teachers found matching your criteria.</Alert>
      ) : (
        <Grid container spacing={3}>
          {teachers.map(teacher => (
            <Grid item xs={12} sm={6} md={4} key={teacher._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 2 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box 
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.light', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        mr: 2
                      }}
                    >
                      <Person />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>{teacher.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{teacher.email}</Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" color="textSecondary" mt={2} mb={1}>
                    Subjects:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.map(sub => (
                      <Chip key={sub} label={sub} size="small" color="primary" variant="outlined" />
                    )) : <Typography variant="body2" color="textSecondary">None specified</Typography>}
                  </Box>

                  <Typography variant="subtitle2" color="textSecondary" mt={2} mb={1}>
                    Modules:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {teacher.modules && teacher.modules.length > 0 ? teacher.modules.map(mod => (
                      <Chip key={mod} label={mod} size="small" color="secondary" variant="outlined" />
                    )) : <Typography variant="body2" color="textSecondary">None specified</Typography>}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    onClick={() => onSelectTeacher(teacher._id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Select Teacher
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TeacherSelection;
