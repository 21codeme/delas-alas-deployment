// Global variables
let dentists = [];
let filteredDentists = [];
let supabase = null;

// Initialize Supabase
const supabaseUrl = 'https://xlubjwiumytdkxrzojdg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWJqd2l1bXl0ZGt4cnpvamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTQ2MDAsImV4cCI6MjA3NjI5MDYwMH0.RYal1H6Ibre86bHyMIAmc65WCLt1x0j9p_hbEWdBXnQ';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if loaded in iframe
    if (window !== window.top) {
        document.body.classList.add('iframe-mode');
    }
    
    // Initialize Supabase
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        } else if (typeof window.createClient !== 'undefined') {
            supabase = window.createClient(supabaseUrl, supabaseKey);
        } else if (typeof LocalSupabaseClient !== 'undefined') {
            supabase = new LocalSupabaseClient(supabaseUrl, supabaseKey);
        }
    } catch (error) {
        console.error('Error initializing Supabase:', error);
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
            // Filter out any null or undefined users first
            const validUsers = users.filter(user => user != null && user !== undefined && user.id);
            // Convert Supabase data to the format expected by the UI
            dentists = validUsers.map(user => ({
                id: user.id,
                name: user.name || 'Unknown Dentist',
                email: user.email || 'No email',
                phone: user.phone || 'No phone',
                specialization: 'General Dentistry', // Default specialization
                license: 'DMD-001', // Default license
                experience: 5, // Default experience
                bio: 'Experienced dental professional',
                status: (presence || []).some(p => p && p.user_id === user.id && p.status === 'online') ? 'online' : 'offline',
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
    // Filter out any undefined or null dentists
    const validDentists = dentists.filter(d => d != null && d !== undefined);
    const onlineId = localStorage.getItem('onlineDentistId');
    const totalDentists = validDentists.length;
    const onlineDentists = validDentists.filter(d => d && (d.id === onlineId || d.email === onlineId)).length;
    const averageRating = validDentists.length > 0 ? 
        (validDentists.reduce((sum, d) => sum + (d.rating || 0), 0) / validDentists.length).toFixed(1) : 0;

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
    // Filter out any undefined or null dentists first
    const validDentists = dentists.filter(d => d != null && d !== undefined);
    filteredDentists = validDentists.map(d => ({
        ...d,
        status: (d && (d.id === onlineIdForStatus || d.email === onlineIdForStatus)) ? 'online' : 'offline'
    })).filter(dentist => {
        if (!dentist) return false;
        const matchesSpecialization = !specializationFilter || (dentist.specialization || '') === specializationFilter;
        const matchesStatus = !statusFilter || (dentist.status || 'offline') === statusFilter;
        const matchesSearch = !searchInput || 
            (dentist.name || '').toLowerCase().includes(searchInput) ||
            (dentist.specialization || '').toLowerCase().includes(searchInput);
        
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

// Password toggle function
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Form submission - Register new dentist
document.getElementById('dentistForm').onsubmit = async function(e) {
    e.preventDefault();
    
    // Get form elements with safety checks
    const nameEl = document.getElementById('dentistName');
    const emailEl = document.getElementById('dentistEmail');
    const phoneEl = document.getElementById('dentistPhone');
    const passwordEl = document.getElementById('dentistPassword');
    const confirmPasswordEl = document.getElementById('dentistConfirmPassword');
    const specializationEl = document.getElementById('dentistSpecialization');
    const licenseEl = document.getElementById('dentistLicense');
    const experienceEl = document.getElementById('dentistExperience');
    const bioEl = document.getElementById('dentistBio');
    
    // Check if all required elements exist
    if (!nameEl || !emailEl || !phoneEl || !passwordEl || !confirmPasswordEl || !specializationEl || !licenseEl || !experienceEl) {
        alert('Error: Form fields not found. Please refresh the page and try again.');
        console.error('Missing form elements:', { nameEl, emailEl, phoneEl, passwordEl, confirmPasswordEl, specializationEl, licenseEl, experienceEl });
        return;
    }
    
    const name = (nameEl.value || '').trim();
    const email = (emailEl.value || '').trim();
    const phone = (phoneEl.value || '').trim();
    const password = passwordEl.value || '';
    const confirmPassword = confirmPasswordEl.value || '';
    const specialization = specializationEl.value || '';
    const license = (licenseEl.value || '').trim();
    const experience = parseInt(experienceEl.value) || 0;
    const bio = (bioEl ? (bioEl.value || '').trim() : '');
    
    // Validate form
    if (!name || !email || !phone || !password || !confirmPassword || !specialization || !license) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Validate phone format
    const phoneDigits = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[\+]?[0-9][\d]{9,14}$/;
    if (!phoneRegex.test(phoneDigits) || phoneDigits.length < 10) {
        alert('Please enter a valid phone number (at least 10 digits).');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#dentistForm button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';
    
    try {
        // Create auth user with Supabase
        let authData, authError;
        
        if (supabase && supabase.auth && supabase.auth.signUp) {
            const result = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        phone: phone,
                        user_type: 'dentist'
                    },
                    emailRedirectTo: window.location.origin + '/index.html'
                }
            });
            authData = result.data;
            authError = result.error;
        } else {
            // Fallback: Use direct API call
            const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: {
                        name: name,
                        phone: phone,
                        user_type: 'dentist'
                    },
                    email_redirect_to: window.location.origin + '/index.html'
                })
            });
            
            const data = await response.json();
            if (!response.ok) {
                authError = data;
            } else {
                authData = data;
            }
        }
        
        if (authError) {
            let errorMessage = 'Registration failed.';
            if (authError.message) {
                if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                    errorMessage = 'This email is already registered.';
                } else if (authError.message.includes('Invalid email')) {
                    errorMessage = 'Please enter a valid email address.';
                } else if (authError.message.includes('Password should be at least')) {
                    errorMessage = 'Password must be at least 6 characters long.';
                } else {
                    errorMessage = 'Registration failed: ' + authError.message;
                }
            }
            alert(errorMessage);
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
        
        // Create user profile in database
        if (authData && authData.user) {
            // Try to create profile using RPC or direct insert
            try {
                // Try RPC function first
                if (supabase && supabase.rpc) {
                    const { error: rpcError } = await supabase.rpc('create_user_profile', {
                        user_id: authData.user.id,
                        user_name: name,
                        user_email: email,
                        user_phone: phone,
                        user_type: 'dentist'
                    });
                    
                    if (rpcError) {
                        console.log('RPC function error:', rpcError);
                        // Fallback to direct insert
                        await callSupabaseAPI('POST', 'users', {
                            id: authData.user.id,
                            name: name,
                            email: email,
                            phone: phone,
                            user_type: 'dentist'
                        });
                    }
                } else {
                    // Direct insert
                    await callSupabaseAPI('POST', 'users', {
                        id: authData.user.id,
                        name: name,
                        email: email,
                        phone: phone,
                        user_type: 'dentist'
                    });
                }
            } catch (profileError) {
                console.error('Error creating user profile:', profileError);
                // Continue even if profile creation fails - the trigger might handle it
            }
        }
        
        // Check if email confirmation is required
        let successMessage = 'Dentist registered successfully!';
        if (authData && authData.user) {
            if (!authData.user.email_confirmed_at) {
                // Email confirmation is required
                console.log('📧 Email confirmation required. Confirmation email should be sent to:', email);
                successMessage = `Dentist registered successfully!\n\nA confirmation email has been sent to:\n${email}\n\nPlease ask the dentist to check their email (including spam folder) and click the verification link to activate their account.\n\nNote: If email confirmation is disabled in Supabase settings, the account will be active immediately.`;
            } else {
                // Email already confirmed (shouldn't happen on new signup, but just in case)
                successMessage = `Dentist registered successfully!\n\nEmail: ${email}\n\nThe dentist can now login with their credentials.`;
            }
        } else {
            console.warn('⚠️ No user data returned from signup. Email confirmation status unknown.');
        }
        
        alert(successMessage);
        closeModal();
        
        // Reload dentists list
        loadDentists();
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + (error.message || 'Unknown error'));
        submitButton.disabled = false;
        submitButton.textContent = originalText;
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
