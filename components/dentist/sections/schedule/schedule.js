// Schedule JavaScript
let schedule = [];
let currentDate = new Date();

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSchedule();
    generateCalendar();
    updateStats();
});

// Load schedule data
function loadSchedule() {
    // Initialize empty array - data will be populated from real-time sources
    schedule = [];

    // Try to load from localStorage first (for demo purposes)
    loadFromLocalStorage();
    
    // Set up real-time listeners (replace with your real-time data source)
    setupRealtimeListeners();
    
    displayTodaySchedule();
    generateCalendar();
    updateStats();
}

// Load data from localStorage (temporary - replace with your real-time source)
function loadFromLocalStorage() {
    try {
        const storedSchedule = localStorage.getItem('dentalSchedule');
        
        if (storedSchedule) {
            schedule = JSON.parse(storedSchedule);
        }
    } catch (error) {
        console.log('No existing schedule found or error loading from storage');
    }
}

// Set up real-time listeners (replace with your Firebase/WebSocket implementation)
function setupRealtimeListeners() {
    // Example: Listen for schedule updates
    // firebase.firestore().collection('schedule').onSnapshot((snapshot) => {
    //     schedule = [];
    //     snapshot.forEach(doc => {
    //         schedule.push({ id: doc.id, ...doc.data() });
    //     });
    //     displayTodaySchedule();
    //     generateCalendar();
    //     updateStats();
    // });
    
    console.log('Schedule section initialized - ready for real-time data');
}

// Display today's schedule
function displayTodaySchedule() {
    const container = document.getElementById('todaySchedule');
    
    if (schedule.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; color: #666; text-align: center;">
                <i class="fas fa-calendar-alt" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="margin: 0 0 10px 0;">No schedule yet</h3>
                <p style="margin: 0;">Schedule slots will appear here when appointments are booked</p>
            </div>
        `;
        return;
    }

    container.innerHTML = schedule.map(slot => `
        <div class="time-slot-card ${slot.status}">
            <div class="time-slot-header">
                <span class="time-slot-time">${slot.time}</span>
                <span class="time-slot-status ${slot.status}">${slot.status}</span>
            </div>
            <div class="time-slot-patient">
                ${slot.patient ? `👤 ${slot.patient}` : '🕐 Available Slot'}
            </div>
            <div class="time-slot-patient" style="color: #888;">
                ${slot.service}
            </div>
        </div>
    `).join('');
}

// Generate calendar
function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    document.getElementById('currentMonth').textContent = 
        currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Check if today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        // Check if has appointments (replace with real data)
        const hasAppointments = schedule.some(slot => {
            // This would check if slot.date matches this day
            return false; // For now, no appointments
        });
        
        if (hasAppointments) {
            dayElement.classList.add('has-appointments');
        }
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${hasAppointments ? `
                <div class="appointment-dots">
                    <div class="appointment-dot confirmed"></div>
                    <div class="appointment-dot pending"></div>
                </div>
            ` : ''}
        `;
        
        dayElement.onclick = () => showDayDetails(day);
        calendarDays.appendChild(dayElement);
    }
}

// Update statistics
function updateStats() {
    const totalAppointments = schedule.length;
    const completedAppointments = schedule.filter(s => s.status === 'confirmed').length;
    const pendingAppointments = schedule.filter(s => s.status === 'pending').length;
    const availableSlots = schedule.filter(s => s.status === 'available').length;

    document.getElementById('totalAppointments').textContent = totalAppointments;
    document.getElementById('completedAppointments').textContent = completedAppointments;
    document.getElementById('pendingAppointments').textContent = pendingAppointments;
    document.getElementById('availableSlots').textContent = availableSlots;
}

// Calendar navigation
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

// Show day details
function showDayDetails(day) {
    const dateStr = `${currentDate.toLocaleDateString('en-US', { month: 'short' })} ${day}, ${currentDate.getFullYear()}`;
    alert(`Schedule for ${dateStr}\n\nClick to view detailed appointments for this day.`);
}

// Action functions
function addTimeSlot() {
    alert('Opening add time slot form...');
    // Implement your add time slot logic here
}

function viewCalendar() {
    alert('Switching to calendar view...');
    // Implement your calendar view logic here
}

// Real-time updates (replace with your actual real-time implementation)
// This function will be called when schedule updates arrive from your backend
function updateScheduleData(newSchedule) {
    schedule = newSchedule;
    displayTodaySchedule();
    generateCalendar();
    updateStats();
}

// Example function to add new schedule slot
function addNewScheduleSlot(slotData) {
    const newSlot = {
        id: Date.now(), // Generate unique ID
        ...slotData,
        status: slotData.patient ? 'pending' : 'available'
    };
    
    schedule.push(newSlot);
    displayTodaySchedule();
    generateCalendar();
    updateStats();
    
    // Save to localStorage (replace with your backend save)
    localStorage.setItem('dentalSchedule', JSON.stringify(schedule));
    
    return newSlot;
}

// Example function to book available slot
function bookAvailableSlot(slotId, patientData) {
    const slot = schedule.find(s => s.id === slotId);
    if (slot && slot.status === 'available') {
        slot.patient = patientData.name;
        slot.service = patientData.service;
        slot.status = 'pending';
        
        displayTodaySchedule();
        generateCalendar();
        updateStats();
        
        // Save to localStorage (replace with your backend save)
        localStorage.setItem('dentalSchedule', JSON.stringify(schedule));
    }
}
