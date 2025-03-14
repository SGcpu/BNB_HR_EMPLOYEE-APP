// Global State Management
const DashboardState = {
    user: {
        name: 'Percival Thomas',
        id: 'EMP001',
        rating: 4.8,
        tier: 'Platinum',
        hoursWorked: 40
    },
    attendance: {
        isClocked: false,
        startTime: null,
        weeklyHours: 40
    },
    break: {
        isOnBreak: false,
        startTime: null,
        type: null,
        timer: null
    },
    badges: [
        { id: 1, name: 'Customer Service', icon: '🌟', achieved: true },
        { id: 2, name: 'Team Player', icon: '👥', achieved: true },
        { id: 3, name: 'Innovation', icon: '💡', achieved: false },
        { id: 4, name: 'Excellence in Service', icon: '🏆', achieved: false }
    ],
    schedule: [
        { day: 'Monday', shift: 'Morning', hours: '6:00 AM - 2:00 PM', breaks: '9:00 AM, 12:00 PM' },
        { day: 'Tuesday', shift: 'Morning', hours: '6:00 AM - 2:00 PM', breaks: '9:00 AM, 12:00 PM' },
        { day: 'Wednesday', shift: 'Day', hours: '9:00 AM - 5:00 PM', breaks: '11:00 AM, 2:00 PM' },
        { day: 'Thursday', shift: 'Day', hours: '9:00 AM - 5:00 PM', breaks: '11:00 AM, 2:00 PM' },
        { day: 'Friday', shift: 'Evening', hours: '2:00 PM - 10:00 PM', breaks: '5:00 PM, 8:00 PM' }
    ],
    notifications: []
};

// DOM Elements Cache
const DOM = {
    clockInBtn: document.getElementById('clock-in'),
    clockOutBtn: document.getElementById('clock-out'),
    hoursWorked: document.getElementById('hours-worked'),
    attendanceRate: document.getElementById('attendance-rate'),
    breakTimer: document.getElementById('break-timer'),
    breakType: document.getElementById('break-type'),
    notificationElement: document.getElementById('notification'),
    breakSchedule: document.getElementById('break-schedule'),
    scheduleTable: document.getElementById('schedule-table'),
    usernameDisplay: document.getElementById('username-display'),
    roleDisplay: document.getElementById('role-display'),
    badgesContainer: document.getElementById('badges-container'),
    leaderboardContent: document.getElementById('leaderboard-content')
};

// Utility Functions
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
    });
}

function padNumber(num) {
    return num.toString().padStart(2, '0');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = DOM.notificationElement;
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Break Management
function startBreak() {
    if (DashboardState.break.isOnBreak) {
        showNotification('You are already on a break!', 'warning');
        return;
    }

    if (!DashboardState.attendance.isClocked) {
        showNotification('You must be clocked in to take a break!', 'warning');
        return;
    }

    const breakTypeSelect = DOM.breakType;
    if (!breakTypeSelect) return;

    DashboardState.break.isOnBreak = true;
    DashboardState.break.startTime = new Date();
    DashboardState.break.type = breakTypeSelect.value;

    // Start timer update
    DashboardState.break.timer = setInterval(updateBreakTimer, 1000);

    // Update UI
    const startBreakBtn = document.querySelector('button[onclick="startBreak()"]');
    if (startBreakBtn) startBreakBtn.disabled = true;

    showNotification('Break started', 'success');
}

function endBreak() {
    if (!DashboardState.break.isOnBreak) {
        showNotification('No break currently in progress', 'warning');
        return;
    }

    clearInterval(DashboardState.break.timer);
    DashboardState.break.isOnBreak = false;
    
    if (DOM.breakTimer) DOM.breakTimer.textContent = '00:00:00';

    // Update UI
    const startBreakBtn = document.querySelector('button[onclick="startBreak()"]');
    if (startBreakBtn) startBreakBtn.disabled = false;

    updateBreakSchedule();
    showNotification('Break ended', 'success');
}

function updateBreakTimer() {
    if (!DashboardState.break.startTime) return;

    if (!DOM.breakTimer) return;

    const now = new Date();
    const diff = now - DashboardState.break.startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    DOM.breakTimer.textContent = `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
}

function updateBreakSchedule() {
    const breakTable = DOM.breakSchedule;
    if (!breakTable) return;

    const newRow = breakTable.insertRow(1);
    const currentTime = new Date().toLocaleTimeString();

    const cells = [
        DashboardState.break.type === 'lunch' ? 'Lunch Break' : 'Coffee Break',
        DashboardState.break.type === 'lunch' ? '45 min' : '15 min',
        `Completed at ${currentTime}`
    ];

    cells.forEach(content => {
        const cell = newRow.insertCell();
        cell.textContent = content;
    });
}

// Badge Management
function loadBadges() {
    if (!DOM.badgesContainer) return;
    DOM.badgesContainer.innerHTML = '';

    DashboardState.badges.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge-item ${badge.achieved ? 'achieved' : ''}`;
        badgeElement.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        `;
        DOM.badgesContainer.appendChild(badgeElement);
    });
}

// Time & Attendance
function clockIn() {
    if (DashboardState.attendance.isClocked) {
        showNotification('Already clocked in!', 'warning');
        return;
    }

    DashboardState.attendance.isClocked = true;
    DashboardState.attendance.startTime = new Date();
    updateClockStatus();
    showNotification(`Clocked in at ${formatTime(new Date())}`, 'success');
    updateHoursWorked();
}

function clockOut() {
    if (!DashboardState.attendance.isClocked) {
        showNotification('Not clocked in!', 'warning');
        return;
    }

    if (DashboardState.break.isOnBreak) {
        showNotification('Please end your break before clocking out', 'warning');
        return;
    }

    DashboardState.attendance.isClocked = false;
    updateClockStatus();
    showNotification(`Clocked out at ${formatTime(new Date())}`, 'success');
    updateHoursWorked();
}

function updateClockStatus() {
    if (!DOM.clockInBtn || !DOM.clockOutBtn) return;
    
    DOM.clockInBtn.disabled = DashboardState.attendance.isClocked;
    DOM.clockOutBtn.disabled = !DashboardState.attendance.isClocked;
}

function updateHoursWorked() {
    if (!DOM.hoursWorked) return;

    const currentHours = parseInt(DOM.hoursWorked.textContent);
    if (DashboardState.attendance.isClocked) {
        DOM.hoursWorked.textContent = currentHours + 4;
    }
}

// Leaderboard Management
function initializeLeaderboard(period) {
    if (!DOM.leaderboardContent) return;

    const leaderboardData = period === 'weekly' ? getWeeklyLeaderboard() : getMonthlyLeaderboard();
    
    DOM.leaderboardContent.innerHTML = `
        <table class="leaderboard-table">
            <tr>
                <th>Rank</th>
                <th>Employee</th>
                <th>Score</th>
            </tr>
            ${leaderboardData.map((entry, index) => `
                <tr${entry.name === DashboardState.user.name ? ' class="current-user"' : ''}>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

function getWeeklyLeaderboard() {
    return [
        { name: 'Percival Thomas', score: 95 },
        { name: 'Jane Smith', score: 92 },
        { name: 'John Doe', score: 88 },
        { name: 'Alice Johnson', score: 85 },
        { name: 'Bob Wilson', score: 82 }
    ];
}

function getMonthlyLeaderboard() {
    return [
        { name: 'Jane Smith', score: 94 },
        { name: 'Percival Thomas', score: 93 },
        { name: 'Alice Johnson', score: 90 },
        { name: 'John Doe', score: 87 },
        { name: 'Bob Wilson', score: 85 }
    ];
}

function switchLeaderboard(period) {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    event.target.classList.add('active');
    initializeLeaderboard(period);
}

// Schedule Management
function loadSchedule() {
    if (!DOM.scheduleTable) return;

    DOM.scheduleTable.innerHTML = `
        <tr>
            <th>Day</th>
            <th>Shift</th>
            <th>Hours</th>
            <th>Break Schedule</th>
        </tr>
    `;

    DashboardState.schedule.forEach(day => {
        const row = DOM.scheduleTable.insertRow();
        row.innerHTML = `
            <td>${day.day}</td>
            <td>${day.shift}</td>
            <td>${day.hours}</td>
            <td>${day.breaks}</td>
        `;
    });
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Request handlers
function requestLeave() {
    openModal('leave-modal');
}

function requestTraining() {
    openModal('training-modal');
}

function viewTrainingCatalog() {
    openModal('training-catalog-modal');
}

function viewPayHistory() {
    openModal('pay-history-modal');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user info
    if (DOM.usernameDisplay) DOM.usernameDisplay.textContent = DashboardState.user.name;
    if (DOM.roleDisplay) DOM.roleDisplay.textContent = `Employee ID: ${DashboardState.user.id}`;
    if (DOM.hoursWorked) DOM.hoursWorked.textContent = DashboardState.user.hoursWorked;

    // Initialize components
    loadSchedule();
    loadBadges();
    initializeLeaderboard('weekly');
    updateClockStatus();

    // Set up modal close buttons
    document.querySelectorAll('.close-button').forEach(button => {
        button.onclick = function() {
            const modal = button.closest('.modal');
            if (modal) modal.style.display = 'none';
        };
    });

    // Set up form submissions
    const leaveForm = document.getElementById('leave-form');
    if (leaveForm) {
        leaveForm.onsubmit = function(e) {
            e.preventDefault();
            showNotification('Leave request submitted successfully', 'success');
            closeModal('leave-modal');
        };
    }

    const trainingForm = document.getElementById('training-form');
    if (trainingForm) {
        trainingForm.onsubmit = function(e) {
            e.preventDefault();
            showNotification('Training request submitted successfully', 'success');
            closeModal('training-modal');
        };
    }

    // Window click handler for modals
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    // Add initial notification
    showNotification('Welcome to your dashboard!', 'info');
});