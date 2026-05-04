const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const reviewRoutes = require('./src/routes/reviewRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const userRoutes = require('./src/routes/userRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Best Teacher Reviews & Support API is running...');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log(err));
