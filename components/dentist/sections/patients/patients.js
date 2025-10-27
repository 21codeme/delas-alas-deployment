// Patients JavaScript
let patients = [];
let filteredPatients = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    updateStats();
});

// Load patients data
function loadPatients() {
    // Initialize empty array - data will be populated from real-time sources
    patients = [];
    filteredPatients = [];

    // Try to load from localStorage first (for demo purposes)
    loadFromLocalStorage();
    
    // Set up real-time listeners (replace with your real-time data source)
    setupRealtimeListeners();
    
    displayPatients();
    updateStats();
}

// Load data from localStorage (temporary - replace with your real-time source)
function loadFromLocalStorage() {
    try {
        const storedPatients = localStorage.getItem('dentalPatients');
        
        if (storedPatients) {
            patients = JSON.parse(storedPatients);
            filteredPatients = [...patients];
        }
    } catch (error) {
        console.log('No existing patients found or error loading from storage');
    }
}

// Set up real-time listeners (replace with your Firebase/WebSocket implementation)
function setupRealtimeListeners() {
    // Example: Listen for new patients
    // firebase.firestore().collection('patients').onSnapshot((snapshot) => {
    //     patients = [];
    //     snapshot.forEach(doc => {
    //         patients.push({ id: doc.id, ...doc.data() });
    //     });
    //     filteredPatients = [...patients];
    //     displayPatients();
    //     updateStats();
    // });
    
    console.log('Patients section initialized - ready for real-time data');
}

// Update statistics
function updateStats() {
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const newThisWeek = patients.filter(p => {
        const visitDate = new Date(p.lastVisit);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return visitDate >= weekAgo;
    }).length;

    document.getElementById('totalPatients').textContent = totalPatients;
    document.getElementById('activePatients').textContent = activePatients;
    document.getElementById('newThisWeek').textContent = newThisWeek;
}

// Display patients in table
function displayPatients() {
    const tbody = document.getElementById('patientsTableBody');
    
    if (filteredPatients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div style="padding: 40px; color: #666;">
                        <i class="fas fa-users" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <h3 style="margin: 0 0 10px 0;">No patients registered yet</h3>
                        <p style="margin: 0;">Patient records will appear here when they register</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredPatients.map(patient => `
        <tr>
            <td>
                <div class="patient-cell">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="patient-details">
                        <strong>${patient.name}</strong>
                        <p>ID: PAT-${String(patient.id).padStart(3, '0')}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div>${patient.email}</div>
                    <div>${patient.phone}</div>
                </div>
            </td>
            <td>${formatDate(patient.lastVisit)}</td>
            <td style="text-align: center;">${patient.totalVisits}</td>
            <td>
                <span class="status-badge ${patient.status}">${patient.status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="viewPatient(${patient.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editPatient(${patient.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePatient(${patient.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter patients
function filterPatients() {
    const searchInput = document.getElementById('patientSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchInput) || 
                            patient.email.toLowerCase().includes(searchInput);
        const matchesStatus = !statusFilter || patient.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    displayPatients();
}

// Sort patients
function sortPatients() {
    const sortBy = document.getElementById('sortBy').value;

    filteredPatients.sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'lastVisit') {
            return new Date(b.lastVisit) - new Date(a.lastVisit);
        } else if (sortBy === 'totalVisits') {
            return b.totalVisits - a.totalVisits;
        }
        return 0;
    });

    displayPatients();
}

// Format date
function formatDate(dateString) {
    if (dateString === 'Never') return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Action functions
function addNewPatient() {
    alert('Opening new patient form...');
    // Implement your add patient form logic here
}

function exportPatients() {
    alert('Exporting patient data...');
    // Implement your export logic here
}

function viewPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Patient Details</h2>
            <div style="padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div class="patient-avatar" style="width: 80px; height: 80px; font-size: 36px; margin-right: 20px;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0;">${patient.name}</h3>
                        <p style="margin: 5px 0; color: #666;">ID: PAT-${String(patient.id).padStart(3, '0')}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <div>
                        <strong>Email:</strong>
                        <p style="color: #666;">${patient.email}</p>
                    </div>
                    <div>
                        <strong>Phone:</strong>
                        <p style="color: #666;">${patient.phone}</p>
                    </div>
                    <div>
                        <strong>Last Visit:</strong>
                        <p style="color: #666;">${formatDate(patient.lastVisit)}</p>
                    </div>
                    <div>
                        <strong>Total Visits:</strong>
                        <p style="color: #666;">${patient.totalVisits}</p>
                    </div>
                    <div>
                        <strong>Status:</strong>
                        <p><span class="status-badge ${patient.status}">${patient.status}</span></p>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('patientModal').style.display = 'block';
    }
}

function editPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient) {
        alert(`Editing patient: ${patient.name}`);
        // Implement your edit patient logic here
    }
}

function deletePatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient && confirm(`Delete patient ${patient.name}?`)) {
        patients = patients.filter(p => p.id !== id);
        filteredPatients = filteredPatients.filter(p => p.id !== id);
        displayPatients();
        updateStats();
        alert('Patient deleted successfully.');
    }
}

function closeModal() {
    document.getElementById('patientModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('patientModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Real-time updates (replace with your actual real-time implementation)
// This function will be called when new patients arrive from your backend
function updatePatientsData(newPatients) {
    patients = newPatients;
    filteredPatients = [...patients];
    displayPatients();
    updateStats();
}

// Example function to add new patient (called when patient registers)
function addNewPatient(patientData) {
    const newPatient = {
        id: Date.now(), // Generate unique ID
        ...patientData,
        lastVisit: 'Never',
        totalVisits: 0,
        status: 'active' // Default status
    };
    
    patients.push(newPatient);
    filteredPatients = [...patients];
    displayPatients();
    updateStats();
    
    // Save to localStorage (replace with your backend save)
    localStorage.setItem('dentalPatients', JSON.stringify(patients));
    
    return newPatient;
}

// Example function to update patient visit
function updatePatientVisit(patientId, visitDate) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        patient.lastVisit = visitDate;
        patient.totalVisits = (patient.totalVisits || 0) + 1;
        filteredPatients = [...patients];
        displayPatients();
        updateStats();
        
        // Save to localStorage (replace with your backend save)
        localStorage.setItem('dentalPatients', JSON.stringify(patients));
    }
}
