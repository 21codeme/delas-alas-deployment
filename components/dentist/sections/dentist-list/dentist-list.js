// Global variables
let dentists = [];
let filteredDentists = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if loaded in iframe
    if (window !== window.top) {
        document.body.classList.add('iframe-mode');
    }
    loadDentists();
});

// Load dentists data
async function loadDentists() {
    console.log('🔄 Loading dentists data...');
    
    // Initialize empty array
    dentists = [];

    // Load dentists from Supabase database
    await loadDentistsFromDatabase();
    
    // Update the UI
    updateStats();
    filterDentists();
    
    console.log('✅ Dentists data loaded successfully');
}

// Load dentists from Supabase database
async function loadDentistsFromDatabase() {
    try {
        console.log('🔄 Loading dentists from database...');
        
        // Direct API call to Supabase
        const [users, presence] = await Promise.all([
            callSupabaseAPI('GET', 'users?user_type=eq.dentist'),
            callSupabaseAPI('GET', 'presence')
        ]);
        
        console.log('📊 Raw users:', users);
        console.log('📊 Raw presence:', presence);
        
        if (users && users.length > 0) {
            // Convert Supabase data to the format expected by the UI
            dentists = users.map(user => ({
                id: user.id,
                name: user.name || 'Unknown Dentist',
                email: user.email || 'No email',
                phone: user.phone || 'No phone',
                specialization: 'General Dentistry', // Default specialization
                license: 'DMD-001', // Default license
                experience: 5, // Default experience
                bio: 'Experienced dental professional',
                status: (presence || []).some(p => p.user_id === user.id && p.status === 'online') ? 'online' : 'offline',
                rating: 4.5, // Default rating
                patientsCount: 0, // This would need to be calculated from appointments
                appointmentsToday: 0 // This would need to be calculated from appointments
            }));
            // Fallback: mark the currently logged-in dentist online immediately
            try {
                const me = JSON.parse(localStorage.getItem('currentUser') || 'null');
                if (me && me.id) {
                    dentists = dentists.map(d => ({
                        ...d,
                        status: d.id === me.id ? 'online' : d.status
                    }));
                }
            } catch (e) {}
            console.log('✅ Loaded', dentists.length, 'dentists with presence from database:', dentists);
        } else {
            console.log('ℹ️ No dentists found in database');
            console.log('🔍 API Response:', data);
            dentists = [];
        }
    } catch (error) {
        console.error('❌ Error loading dentists from database:', error);
        console.error('❌ Error details:', error.message);
        dentists = [];
    }
}

// Direct API call function (no CDN required)
async function callSupabaseAPI(method, endpoint, body = null) {
    const SUPABASE_URL = 'https://xlubjwiumytdkxrzojdg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWJqd2l1bXl0ZGt4cnpvamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTQ2MDAsImV4cCI6MjA3NjI5MDYwMH0.RYal1H6Ibre86bHyMIAmc65WCLt1x0j9p_hbEWdBXnQ';
    
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    const options = {
        method: method,
        headers: headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        console.log('🌐 Making API call to:', `${SUPABASE_URL}/rest/v1/${endpoint}`);
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
        
        console.log('📥 Response status:', response.status);
        
        // Check if response has content
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            console.log('📥 Raw response:', text);
            
            if (text.trim() === '') {
                data = [];
            } else {
                data = JSON.parse(text);
            }
        } else {
            const text = await response.text();
            data = text ? { message: text } : {};
        }

        if (!response.ok) {
            console.error('❌ API Error:', data);
            throw new Error(data.message || data.msg || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ API Success:', data);
        return data;
        
    } catch (error) {
        console.error('❌ API Call Error:', error);
        throw new Error(`API call failed: ${error.message}`);
    }
}

// Set up real-time listeners (replace with your Firebase/WebSocket implementation)
function setupRealtimeListeners() {
    // Example: Listen for dentist updates
    // firebase.firestore().collection('dentists').onSnapshot((snapshot) => {
    //     dentists = [];
    //     snapshot.forEach(doc => {
    //         dentists.push({ id: doc.id, ...doc.data() });
    //     });
    //     updateStats();
    //     filterDentists();
    // });
    
    console.log('Dentist list section initialized - ready for real-time data');
}

// Update statistics
function updateStats() {
    const onlineId = localStorage.getItem('onlineDentistId');
    const totalDentists = dentists.length;
    const onlineDentists = dentists.filter(d => (d.id === onlineId || d.email === onlineId)).length;
    const averageRating = dentists.length > 0 ? 
        (dentists.reduce((sum, d) => sum + d.rating, 0) / dentists.length).toFixed(1) : 0;

    document.getElementById('totalDentists').textContent = totalDentists;
    document.getElementById('onlineDentists').textContent = onlineDentists;
    document.getElementById('averageRating').textContent = averageRating;
}

// Filter dentists
function filterDentists() {
    const specializationFilter = document.getElementById('specializationFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    const onlineIdForStatus = localStorage.getItem('onlineDentistId');
    filteredDentists = dentists.map(d => ({
        ...d,
        status: (d.id === onlineIdForStatus || d.email === onlineIdForStatus) ? 'online' : 'offline'
    })).filter(dentist => {
        const matchesSpecialization = !specializationFilter || dentist.specialization === specializationFilter;
        const matchesStatus = !statusFilter || dentist.status === statusFilter;
        const matchesSearch = !searchInput || 
            dentist.name.toLowerCase().includes(searchInput) ||
            dentist.specialization.toLowerCase().includes(searchInput);
        
        return matchesSpecialization && matchesStatus && matchesSearch;
    });

    displayDentists();
}

// Display dentists
function displayDentists() {
    const container = document.getElementById('dentistGrid');
    
    if (filteredDentists.length === 0) {
        if (dentists.length === 0) {
            // No dentists at all
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-md"></i>
                    <h3>No dentists registered yet</h3>
                    <p>Dentist profiles will appear here when they join the clinic</p>
                </div>
            `;
        } else {
            // Dentists exist but filtered out
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No dentists found</h3>
                    <p>Try adjusting your search filters</p>
                </div>
            `;
        }
        return;
    }

    container.innerHTML = filteredDentists.map(dentist => `
        <div class="dentist-card">
            <div class="dentist-card-header">
                <div class="status-badge status-${dentist.status}">${dentist.status}</div>
                <div class="dentist-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="dentist-name">${dentist.name}</div>
                <div class="dentist-specialization">${dentist.specialization}</div>
            </div>
            <div class="dentist-card-body">
                <div class="dentist-info">
                    <div class="info-item">
                        <i class="fas fa-envelope"></i>
                        <span>${dentist.email}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-phone"></i>
                        <span>${dentist.phone}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-id-card"></i>
                        <span>License: ${dentist.license}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${dentist.experience} years experience</span>
                    </div>
                </div>
                <div class="dentist-stats">
                    <div class="stat-item">
                        <div class="number">${dentist.rating}</div>
                        <div class="label">Rating</div>
                    </div>
                    <div class="stat-item">
                        <div class="number">${dentist.patientsCount}</div>
                        <div class="label">Patients</div>
                    </div>
                    <div class="stat-item">
                        <div class="number">${dentist.appointmentsToday}</div>
                        <div class="label">Today</div>
                    </div>
                </div>
                <div class="dentist-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewDentist('${dentist.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editDentist('${dentist.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="messageDentist('${dentist.id}')">
                        <i class="fas fa-comment"></i> Message
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Navigation function
function navigateToSection(section) {
    // If loaded in iframe, communicate with parent
    if (window !== window.top) {
        window.parent.postMessage({ action: 'loadSection', section: section }, '*');
    } else {
        // If standalone, navigate directly
        window.location.href = `../${section}/${section}-standalone.html`;
    }
}

// Action functions
function addNewDentist() {
    document.getElementById('dentistModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('dentistModal').style.display = 'none';
    document.getElementById('dentistForm').reset();
}

// Form submission
document.getElementById('dentistForm').onsubmit = function(e) {
    e.preventDefault();
    
    const dentistData = {
        name: document.getElementById('dentistName').value,
        email: document.getElementById('dentistEmail').value,
        phone: document.getElementById('dentistPhone').value,
        specialization: document.getElementById('dentistSpecialization').value,
        license: document.getElementById('dentistLicense').value,
        experience: parseInt(document.getElementById('dentistExperience').value),
        bio: document.getElementById('dentistBio').value,
        status: 'offline',
        rating: 0,
        patientsCount: 0,
        appointmentsToday: 0
    };
    
    if (dentistData.name && dentistData.email && dentistData.phone && dentistData.specialization) {
        addDentist(dentistData);
        alert('Dentist added successfully!');
        closeModal();
    } else {
        alert('Please fill in all required fields.');
    }
};

function addDentist(dentistData) {
    const newDentist = {
        id: Date.now(),
        ...dentistData
    };
    
    dentists.push(newDentist);
    localStorage.setItem('clinicDentists', JSON.stringify(dentists));
    updateStats();
    filterDentists();
}

function exportDentists() {
    alert('Export dentists functionality - integrate with your export system');
}

function viewDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const modal = document.getElementById('viewEditMessageModal');
    if (!dentist || !modal) return;
    document.getElementById('vemTitle').textContent = 'View Dentist';
    document.getElementById('vemBody').innerHTML = `
        <div class="form-group"><label>Name</label><input type="text" value="${dentist.name}" disabled></div>
        <div class="form-group"><label>Email</label><input type="text" value="${dentist.email}" disabled></div>
        <div class="form-group"><label>Phone</label><input type="text" value="${dentist.phone}" disabled></div>
        <div class="form-group"><label>Specialization</label><input type="text" value="${dentist.specialization}" disabled></div>
        <div class="form-group"><label>Experience</label><input type="text" value="${dentist.experience} years" disabled></div>
        <div class="form-group"><label>Bio</label><textarea disabled>${dentist.bio}</textarea></div>
    `;
    document.getElementById('vemActions').innerHTML = `<button class="btn btn-secondary" onclick="closeVem()">Close</button>`;
    modal.style.display = 'block';
}

function editDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const modal = document.getElementById('viewEditMessageModal');
    if (!dentist || !modal) return;
    document.getElementById('vemTitle').textContent = 'Edit Dentist';
    document.getElementById('vemBody').innerHTML = `
        <form id="editDentistForm">
            <div class="form-group"><label>Name</label><input type="text" id="eName" value="${dentist.name}" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="eEmail" value="${dentist.email}" required></div>
            <div class="form-group"><label>Phone</label><input type="tel" id="ePhone" value="${dentist.phone}" required></div>
            <div class="form-group"><label>Specialization</label><input type="text" id="eSpec" value="${dentist.specialization}" required></div>
            <div class="form-group"><label>Experience (years)</label><input type="number" id="eExp" value="${dentist.experience}" min="0" required></div>
            <div class="form-group"><label>Bio</label><textarea id="eBio">${dentist.bio}</textarea></div>
        </form>
    `;
    document.getElementById('vemActions').innerHTML = `
        <button class="btn btn-secondary" onclick="closeVem()">Cancel</button>
        <button class="btn btn-primary" onclick="saveDentistEdit('${id}')">Save</button>
    `;
    modal.style.display = 'block';
}

function messageDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const modal = document.getElementById('viewEditMessageModal');
    if (!dentist || !modal) return;
    document.getElementById('vemTitle').textContent = 'Message Dentist';
    document.getElementById('vemBody').innerHTML = `
        <div class="form-group"><label>To</label><input type="text" value="${dentist.email}" disabled></div>
        <div class="form-group"><label>Subject</label><input type="text" id="mSubject" placeholder="Subject"></div>
        <div class="form-group"><label>Message</label><textarea id="mBody" rows="5" placeholder="Your message..."></textarea></div>
    `;
    document.getElementById('vemActions').innerHTML = `
        <button class="btn btn-secondary" onclick="closeVem()">Cancel</button>
        <button class="btn btn-primary" onclick="sendMessageToDentist('${id}')">Send</button>
    `;
    modal.style.display = 'block';
}

// Real-time update functions (for integration with your backend)
function updateDentistsData() {
    updateStats();
    filterDentists();
}

function addNewDentist(dentistData) {
    dentists.push(dentistData);
    localStorage.setItem('clinicDentists', JSON.stringify(dentists));
    updateDentistsData();
}

// Save edit
function saveDentistEdit(id) {
    const idx = dentists.findIndex(d => d.id == id);
    if (idx === -1) return;
    const updated = {
        ...dentists[idx],
        name: document.getElementById('eName').value,
        email: document.getElementById('eEmail').value,
        phone: document.getElementById('ePhone').value,
        specialization: document.getElementById('eSpec').value,
        experience: parseInt(document.getElementById('eExp').value) || 0,
        bio: document.getElementById('eBio').value
    };
    dentists[idx] = updated;
    updateDentistsData();
    closeVem();
}

// Send message (placeholder)
function sendMessageToDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const subject = document.getElementById('mSubject').value.trim();
    const body = document.getElementById('mBody').value.trim();
    if (!subject || !body) { alert('Please fill subject and message.'); return; }
    alert(`Message sent to ${dentist?.email || id}!\n\nSubject: ${subject}`);
    closeVem();
}

// Close shared modal
function closeVem() {
    const modal = document.getElementById('viewEditMessageModal');
    if (modal) modal.style.display = 'none';
}

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('mobile-open');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logout functionality - integrate with your authentication system');
        // window.location.href = '/login';
    }
}

// Show mobile menu toggle on small screens
function checkScreenSize() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'block';
    } else {
        menuToggle.style.display = 'none';
        document.getElementById('sidebar').classList.remove('mobile-open');
    }
}

window.addEventListener('resize', checkScreenSize);
checkScreenSize();

// Form submission
document.getElementById('dentistForm').onsubmit = function(e) {
    e.preventDefault();
    
    const dentistData = {
        name: document.getElementById('dentistName').value,
        email: document.getElementById('dentistEmail').value,
        phone: document.getElementById('dentistPhone').value,
        specialization: document.getElementById('dentistSpecialization').value,
        license: document.getElementById('dentistLicense').value,
        experience: parseInt(document.getElementById('dentistExperience').value),
        bio: document.getElementById('dentistBio').value,
        status: 'offline',
        rating: 0,
        patientsCount: 0,
        appointmentsToday: 0
    };
    
    if (dentistData.name && dentistData.email && dentistData.phone && dentistData.specialization) {
        addDentist(dentistData);
        alert('Dentist added successfully!');
        closeModal();
    } else {
        alert('Please fill in all required fields.');
    }
};

function addDentist(dentistData) {
    const newDentist = {
        id: Date.now(),
        ...dentistData
    };
    
    dentists.push(newDentist);
    localStorage.setItem('clinicDentists', JSON.stringify(dentists));
    updateStats();
    filterDentists();
}

function exportDentists() {
    alert('Export dentists functionality - integrate with your export system');
}

function viewDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const modal = document.getElementById('viewEditMessageModal');
    if (!dentist || !modal) return;
    document.getElementById('vemTitle').textContent = 'View Dentist';
    document.getElementById('vemBody').innerHTML = `
        <div class="form-group"><label>Name</label><input type="text" value="${dentist.name}" disabled></div>
        <div class="form-group"><label>Email</label><input type="text" value="${dentist.email}" disabled></div>
        <div class="form-group"><label>Phone</label><input type="text" value="${dentist.phone}" disabled></div>
        <div class="form-group"><label>Specialization</label><input type="text" value="${dentist.specialization}" disabled></div>
        <div class="form-group"><label>Experience</label><input type="text" value="${dentist.experience} years" disabled></div>
        <div class="form-group"><label>Bio</label><textarea disabled>${dentist.bio}</textarea></div>
    `;
    document.getElementById('vemActions').innerHTML = `<button class="btn btn-secondary" onclick="closeVem()">Close</button>`;
    modal.style.display = 'block';
}

function editDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const modal = document.getElementById('viewEditMessageModal');
    if (!dentist || !modal) return;
    document.getElementById('vemTitle').textContent = 'Edit Dentist';
    document.getElementById('vemBody').innerHTML = `
        <form id="editDentistForm">
            <div class="form-group"><label>Name</label><input type="text" id="eName" value="${dentist.name}" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="eEmail" value="${dentist.email}" required></div>
            <div class="form-group"><label>Phone</label><input type="tel" id="ePhone" value="${dentist.phone}" required></div>
            <div class="form-group"><label>Specialization</label><input type="text" id="eSpec" value="${dentist.specialization}" required></div>
            <div class="form-group"><label>Experience (years)</label><input type="number" id="eExp" value="${dentist.experience}" min="0" required></div>
            <div class="form-group"><label>Bio</label><textarea id="eBio">${dentist.bio}</textarea></div>
        </form>
    `;
    document.getElementById('vemActions').innerHTML = `
        <button class="btn btn-secondary" onclick="closeVem()">Cancel</button>
        <button class="btn btn-primary" onclick="saveDentistEdit('${id}')">Save</button>
    `;
    modal.style.display = 'block';
}

function messageDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const modal = document.getElementById('viewEditMessageModal');
    if (!dentist || !modal) return;
    document.getElementById('vemTitle').textContent = 'Message Dentist';
    document.getElementById('vemBody').innerHTML = `
        <div class="form-group"><label>To</label><input type="text" value="${dentist.email}" disabled></div>
        <div class="form-group"><label>Subject</label><input type="text" id="mSubject" placeholder="Subject"></div>
        <div class="form-group"><label>Message</label><textarea id="mBody" rows="5" placeholder="Your message..."></textarea></div>
    `;
    document.getElementById('vemActions').innerHTML = `
        <button class="btn btn-secondary" onclick="closeVem()">Cancel</button>
        <button class="btn btn-primary" onclick="sendMessageToDentist('${id}')">Send</button>
    `;
    modal.style.display = 'block';
}

// Real-time update functions (for integration with your backend)
function updateDentistsData() {
    updateStats();
    filterDentists();
}

function addNewDentist(dentistData) {
    dentists.push(dentistData);
    localStorage.setItem('clinicDentists', JSON.stringify(dentists));
    updateDentistsData();
}

// Save edit
function saveDentistEdit(id) {
    const idx = dentists.findIndex(d => d.id == id);
    if (idx === -1) return;
    const updated = {
        ...dentists[idx],
        name: document.getElementById('eName').value,
        email: document.getElementById('eEmail').value,
        phone: document.getElementById('ePhone').value,
        specialization: document.getElementById('eSpec').value,
        experience: parseInt(document.getElementById('eExp').value) || 0,
        bio: document.getElementById('eBio').value
    };
    dentists[idx] = updated;
    updateDentistsData();
    closeVem();
}

// Send message (placeholder)
function sendMessageToDentist(id) {
    const dentist = dentists.find(d => d.id == id);
    const subject = document.getElementById('mSubject').value.trim();
    const body = document.getElementById('mBody').value.trim();
    if (!subject || !body) { alert('Please fill subject and message.'); return; }
    alert(`Message sent to ${dentist?.email || id}!\n\nSubject: ${subject}`);
    closeVem();
}

// Close shared modal
function closeVem() {
    const modal = document.getElementById('viewEditMessageModal');
    if (modal) modal.style.display = 'none';
}

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('mobile-open');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logout functionality - integrate with your authentication system');
        // window.location.href = '/login';
    }
}

// Show mobile menu toggle on small screens
function checkScreenSize() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'block';
    } else {
        menuToggle.style.display = 'none';
        document.getElementById('sidebar').classList.remove('mobile-open');
    }
}

window.addEventListener('resize', checkScreenSize);
checkScreenSize();
