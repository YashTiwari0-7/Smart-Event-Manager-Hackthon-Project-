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

app.get('/api/certificates/:eventId/:userId/:type', async (req, res) => {
    try {
        const Certificate = require('./models/certificateModel');
        const cert = await Certificate.findOne({
            event: req.params.eventId,
            user: req.params.userId,
            type: req.params.type
        }).populate('user', 'name').populate('event', 'title');

        if (!cert) return res.status(404).send('Certificate not found');

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificate - ${cert.user.name}</title>
            <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; font-family: sans-serif; }
                .cert { width: 800px; height: 550px; background: white; padding: 40px; text-align: center; border: 10px solid #1f2937; position: relative; box-sizing: border-box; }
                h1 { margin-top: 50px; font-size: 48px; color: #111827; text-transform: uppercase; letter-spacing: 4px; }
                p { font-size: 18px; color: #4b5563; margin-top: 30px; }
                .name { font-size: 36px; font-weight: bold; color: #1f2937; margin: 20px 0; border-bottom: 2px solid #d1d5db; display: inline-block; padding-bottom: 10px; width: 80%; }
                .event { font-size: 24px; font-weight: bold; color: #374151; margin-top: 20px; }
                .date { position: absolute; bottom: 50px; left: 50px; font-size: 14px; color: #6b7280; font-weight: bold; }
                .sign { position: absolute; bottom: 50px; right: 50px; font-size: 14px; color: #6b7280; font-weight: bold; border-top: 1px solid #9ca3af; padding-top: 5px; }
                @media print {
                    body { background: white; height: auto; display: block; }
                    .cert { width: 100%; height: auto; min-height: 550px; margin: 0; border: 10px solid #1f2937; page-break-inside: avoid; }
                    @page { size: landscape; margin: 0; }
                }
            </style>
        </head>
        <body onload="setTimeout(() => window.print(), 500)">
            <div class="cert">
                <h1>Certificate of ${cert.type === 'participation' ? 'Participation' : 'Achievement'}</h1>
                <p>This is proudly presented to</p>
                <div class="name">${cert.user.name}</div>
                <p>For excellent performance and participation in</p>
                <div class="event">${cert.event.title}</div>
                <div class="date">Date: ${new Date(cert.createdAt).toLocaleDateString()}</div>
                <div class="sign">Authorized Signature</div>
            </div>
        </body>
        </html>
        `;

        res.send(html);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.use((req, res, next) => {
    next(new AppError('Route not found', 404));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
