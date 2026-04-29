require('dotenv').config();

const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const AfricasTalking = require('africastalking');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const HELP_MESSAGE = 'Invalid report format. Use: StationID#Registered#Cast#Incident e.g. ST001#500#475#None';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const sms = process.env.AFRICASTALKING_API_KEY
    ? AfricasTalking({
        username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
        apiKey: process.env.AFRICASTALKING_API_KEY
    }).SMS
    : null;

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/election_db';

const connectWithRetry = () => {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB successfully'))
        .catch(err => {
            console.error('MongoDB initial connection error:', err.message);
            console.log('Retrying in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        });
};

mongoose.connection.on('disconnected', () => {
    console.warn('Lost MongoDB connection. Mongoose will attempt to auto-reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to MongoDB successfully.');
});

connectWithRetry();

// Define the Report Schema and Model
const reportSchema = new mongoose.Schema({
    id: String,
    stationId: String,
    registered: Number,
    cast: Number,
    incident: String,
    status: String,
    severity: String,
    receivedAt: String,
    sender: String
});
const Report = mongoose.model('Report', reportSchema);

function parsePositiveInteger(value, fieldName) {
    const trimmed = String(value || '').trim();
    if (!/^\d+$/.test(trimmed)) {
        throw new Error(`${fieldName} must be a whole number`);
    }

    return Number(trimmed);
}

function parseSmsReport(text) {
    if (typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('SMS text is required');
    }

    const parts = text.split('#').map(part => part.trim());
    if (parts.length !== 4 || parts.some(part => part.length === 0)) {
        throw new Error('Expected exactly 4 non-empty fields');
    }

    const [stationId, registeredRaw, castRaw, incident] = parts;
    const registered = parsePositiveInteger(registeredRaw, 'Registered voters');
    const cast = parsePositiveInteger(castRaw, 'Cast votes');
    const fraudSuspected = cast > registered;

    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        stationId,
        registered,
        cast,
        incident,
        status: fraudSuspected ? 'Fraud Suspected' : 'Valid',
        severity: fraudSuspected ? 'critical' : incident.toLowerCase() === 'none' ? 'info' : 'warning',
        receivedAt: new Date().toISOString()
    };
}

function getIncomingSmsPayload(body) {
    return {
        sender: body.from || body.msisdn || body.sender || body.phoneNumber,
        text: body.text || body.message || body.sms || ''
    };
}

async function sendHelpSms(to) {
    if (!to) {
        console.warn('Could not send help SMS: sender phone number missing.');
        return;
    }

    if (!sms) {
        console.warn(`Africa's Talking API key missing. Help SMS not sent to ${to}.`);
        return;
    }

    const payload = {
        to: [to],
        message: HELP_MESSAGE
    };

    if (process.env.AFRICASTALKING_SENDER_ID) {
        payload.from = process.env.AFRICASTALKING_SENDER_ID;
    }

    await sms.send(payload);
}

app.get('/health', async (req, res) => {
    const count = await Report.countDocuments();
    res.json({ ok: true, reports: count });
});

app.get('/reports', async (req, res) => {
    const reports = await Report.find().sort({ receivedAt: -1 }).limit(100);
    res.json({ reports });
});

app.post('/webhook', async (req, res, next) => {
    const { sender, text } = getIncomingSmsPayload(req.body);

    try {
        const report = parseSmsReport(text);
        report.sender = sender || 'unknown';

        // Save the new report into MongoDB
        await Report.create(report);

        io.emit('sms:report', report);
        res.status(200).json({ ok: true, report });
    } catch (error) {
        try {
            await sendHelpSms(sender);
        } catch (smsError) {
            console.error('Failed to send help SMS:', smsError);
        }

        res.status(400).json({
            ok: false,
            error: error.message,
            help: HELP_MESSAGE
        });
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        ok: false,
        error: 'Internal server error'
    });
});

io.on('connection', async socket => {
    // Send the latest 50 reports to newly connected clients
    const reports = await Report.find().sort({ receivedAt: -1 }).limit(50);
    socket.emit('reports:snapshot', reports);
});

server.listen(PORT, () => {
    console.log(`ElectionGuard server running on http://localhost:${PORT}`);
});
