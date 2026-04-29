// Data
const regions = [
    'Lagos State, Ward 12', 'Kano State, LGA 4', 'Rivers State, Unit 23',
    'Abuja, FCT', 'Oyo State, Ward 8', 'Delta State, LGA 2',
    'Kaduna State, Ward 15', 'Enugu State, Unit 7', 'Anambra State, Ward 3',
    'Plateau State, LGA 5', 'Edo State, Ward 11', 'Akwa Ibom, Unit 19'
];

const messages = {
    critical: [
        'Multiple voters turned away at Station 234 - ballot papers exhausted',
        'Violence reported at polling unit - observers harassed',
        'Resultsheet altered before transmission at Ward 45',
        'Unauthorized persons attempting to vote at Station 178',
        'Ballot box seized by unknown group at Unit 67'
    ],
    warning: [
        'Voting delayed by 45 minutes due to late equipment delivery',
        'Queue length exceeding 3 hours at Station 189',
        'Some voters without PVC being allowed to vote',
        'Observer credentials not recognized at Station 156',
        'Power outage affecting electronic verification at Unit 92'
    ],
    info: [
        'Heavy rain affecting voter turnout in Zone 7',
        'Observer team arrived safely at Station 156',
        'Voting proceeding smoothly in most locations',
        'Additional ballot papers delivered to Station 201',
        'Voter turnout higher than expected in Ward 5'
    ]
};

const codes = {
    critical: ['INC-001', 'INC-002', 'SEC-001', 'FRD-001', 'BRK-001'],
    warning: ['DLT-001', 'QEU-001', 'AUT-001', 'CRED-001', 'PWR-001'],
    info: ['WTH-001', 'ARR-001', 'OK-001', 'SUP-001', 'TRN-001']
};

const severityCodes = {
    critical: 'FRD-001',
    warning: 'INC-001',
    info: 'OK-001'
};

// State
let feedEntries = [];
let currentFilter = 'all';
let criticalCount = 7;
let warningCount = 12;
let infoCount = 24;
const seenReportIds = new Set();

// DOM Elements
const clockEl = document.getElementById('clock');
const feedListEl = document.getElementById('feedList');
const alertOverlay = document.getElementById('alertOverlay');
const alertBanner = document.getElementById('alertBanner');
const incidentsCard = document.getElementById('incidentsCard');
const incidentCountEl = document.getElementById('incidentCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// Clock
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    };
    clockEl.textContent = now.toLocaleDateString('en-US', options);
}
updateClock();
setInterval(updateClock, 1000);

// Animate numbers
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        element.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

// Initialize metric values
document.querySelectorAll('.metric-value').forEach(el => {
    const target = parseInt(el.dataset.target);
    animateValue(el, 0, target, 2000);
});

// Generate random entry
function generateEntry() {
    const severities = ['critical', 'warning', 'info'];
    const weights = [0.15, 0.25, 0.60];
    const random = Math.random();
    let severity;
    if (random < weights[0]) severity = 'critical';
    else if (random < weights[0] + weights[1]) severity = 'warning';
    else severity = 'info';

    const region = regions[Math.floor(Math.random() * regions.length)];
    const msgList = messages[severity];
    const codeList = codes[severity];

    return {
        id: Date.now(),
        timestamp: new Date(),
        location: region,
        message: msgList[Math.floor(Math.random() * msgList.length)],
        severity: severity,
        code: codeList[Math.floor(Math.random() * codeList.length)]
    };
}

// Format relative time
function formatRelativeTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return date.toLocaleDateString();
}

// Render feed entry
function renderEntry(entry) {
    const div = document.createElement('div');
    div.className = `feed-entry ${entry.severity} new-entry`;
    div.dataset.severity = entry.severity;

    const header = document.createElement('div');
    header.className = 'entry-header';

    const meta = document.createElement('div');
    meta.className = 'entry-meta';

    const time = document.createElement('span');
    time.className = 'entry-time';
    time.textContent = formatRelativeTime(entry.timestamp);

    const location = document.createElement('span');
    location.className = 'entry-location';
    location.textContent = entry.location;

    const code = document.createElement('span');
    code.className = `entry-code ${entry.severity}`;
    code.textContent = entry.code;

    const message = document.createElement('div');
    message.className = 'entry-message';
    message.textContent = entry.message;

    meta.append(time, location);
    header.append(meta, code);
    div.append(header, message);

    setTimeout(() => div.classList.remove('new-entry'), 3000);
    return div;
}

function reportToEntry(report) {
    return {
        id: report.id,
        timestamp: new Date(report.receivedAt),
        location: `Station ${report.stationId}`,
        message: `${report.incident} | Registered: ${report.registered.toLocaleString()} | Cast: ${report.cast.toLocaleString()} | Status: ${report.status}`,
        severity: report.severity,
        code: severityCodes[report.severity] || 'SMS-001'
    };
}

function trimFeedDom() {
    while (feedListEl.children.length > 50) {
        feedListEl.removeChild(feedListEl.lastChild);
    }
}

// Add entry to feed
function addEntry() {
    const entry = generateEntry();
    feedEntries.unshift(entry);
    
    // Update counts
    if (entry.severity === 'critical') {
        criticalCount++;
        incidentCountEl.dataset.target = criticalCount;
        animateValue(incidentCountEl, criticalCount - 1, criticalCount, 500);
        document.getElementById('statCritical').textContent = criticalCount;
        triggerAlert();
    } else if (entry.severity === 'warning') {
        warningCount++;
        document.getElementById('statWarning').textContent = warningCount;
    } else {
        infoCount++;
        document.getElementById('statInfo').textContent = infoCount;
    }

    // Keep max 50 entries
    if (feedEntries.length > 50) feedEntries.pop();

    // Render
    const entryEl = renderEntry(entry);
    feedListEl.insertBefore(entryEl, feedListEl.firstChild);
    trimFeedDom();

    // Apply filter
    applyFilter();
}

function addIncomingReport(report) {
    if (seenReportIds.has(report.id)) return;
    seenReportIds.add(report.id);

    const entry = reportToEntry(report);
    feedEntries.unshift(entry);

    if (entry.severity === 'critical') {
        criticalCount++;
        incidentCountEl.dataset.target = criticalCount;
        animateValue(incidentCountEl, criticalCount - 1, criticalCount, 500);
        document.getElementById('statCritical').textContent = criticalCount;
        triggerAlert();
    } else if (entry.severity === 'warning') {
        warningCount++;
        document.getElementById('statWarning').textContent = warningCount;
    } else {
        infoCount++;
        document.getElementById('statInfo').textContent = infoCount;
    }

    if (feedEntries.length > 50) feedEntries.pop();

    const entryEl = renderEntry(entry);
    feedListEl.insertBefore(entryEl, feedListEl.firstChild);
    trimFeedDom();
    applyFilter();
}

// Apply filter
function applyFilter() {
    const entries = feedListEl.querySelectorAll('.feed-entry');
    entries.forEach(entry => {
        if (currentFilter === 'all' || entry.dataset.severity === currentFilter) {
            entry.style.display = 'block';
        } else {
            entry.style.display = 'none';
        }
    });
}

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilter();
    });
});

// Trigger alert
function triggerAlert() {
    alertOverlay.classList.add('active');
    alertBanner.classList.add('active');
    incidentsCard.classList.add('critical');
    
    setTimeout(() => {
        alertOverlay.classList.remove('active');
    }, 5000);
}

// Initial entries
function initFeed() {
    for (let i = 0; i < 8; i++) {
        const entry = generateEntry();
        entry.timestamp = new Date(Date.now() - Math.random() * 3600000);
        feedEntries.push(entry);
        const entryEl = renderEntry(entry);
        entryEl.classList.remove('new-entry');
        feedListEl.appendChild(entryEl);
    }
    applyFilter();
}

// Initialize
initFeed();

// Add new entries periodically
setInterval(addEntry, Math.random() * 3000 + 5000);

if (window.io) {
    const socket = io();
    socket.on('sms:report', addIncomingReport);
    socket.on('reports:snapshot', reports => {
        reports.slice().reverse().forEach(addIncomingReport);
    });
}
