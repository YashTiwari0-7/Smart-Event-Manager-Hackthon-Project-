require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const AppError = require('./utils/appError');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.json({ message: 'Smart Event Manager API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/coordinator', require('./routes/coordinatorRoutes'));
app.use('/api/participant', require('./routes/participantRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/password-reset', require('./routes/passwordResetRoutes'));

app.use((req, res, next) => {
    next(new AppError('Route not found', 404));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
