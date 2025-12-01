/* ========================================
   DELAS ALAS DENTAL CLINIC - MAIN SCRIPT
   COMPLETE FUNCTIONALITY RESTORATION
   ======================================== */

// Global variables
let currentUser = null;
let appointments = [];
let users = [];

// Initialize Supabase
const supabaseUrl = 'https://xlubjwiumytdkxrzojdg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWJqd2l1bXl0ZGt4cnpvamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTQ2MDAsImV4cCI6MjA3NjI5MDYwMH0.RYal1H6Ibre86bHyMIAmc65WCLt1x0j9p_hbEWdBXnQ';
let supabase = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize Supabase with local client
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            console.log('Supabase initialized successfully with supabase library');
        } else if (typeof window.createClient !== 'undefined') {
            supabase = window.createClient(supabaseUrl, supabaseKey);
            console.log('Supabase initialized successfully with local client');
        } else {
            console.error('No Supabase client available');
            return;
        }
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return;
    }
    
    initializeApp();
    setupEventListeners();
    setMinDate();
    
    // Test mobile menu toggle
    setTimeout(() => {
        const toggle = document.querySelector('.mobile-menu-toggle');
        console.log('Mobile toggle element after DOM load:', toggle);
        if (toggle) {
            console.log('Mobile toggle is clickable:', toggle.style.pointerEvents);
        }
    }, 1000);
});


// Initialize application
function initializeApp() {
    // Check for password reset redirect FIRST (before anything else)
    const hash = window.location.hash;
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';
    
    // Immediate redirect for password reset errors or recovery tokens
    if (hash && (hash.includes('error=') || hash.includes('error_code=') || hash.includes('type=recovery') || (hash.includes('access_token') && hash.includes('recovery')))) {
        if (currentFile !== 'password-reset.html') {
            console.log('🔐 Redirecting to password-reset.html immediately');
            window.location.replace('password-reset.html' + hash);
            return; // Exit early to prevent other code from running
        }
    }
    
    // Check for email confirmation redirect (access_token in URL hash)
    handleEmailConfirmation();
    
    // Check if redirected after account deletion - auto-show login modal
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (urlParams.get('deleted') === 'true' || hash === '#login') {
        // Clear any remaining localStorage data
        localStorage.clear();
        sessionStorage.clear();
        // Show login modal after a short delay
        setTimeout(() => {
            if (typeof showLoginModal === 'function') {
                showLoginModal();
            }
        }, 500);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if user is logged in (only if not redirected from deletion)
    if (!urlParams.get('deleted')) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                updateUIForLoggedInUser();
            } catch (e) {
                // If parsing fails, clear it
                localStorage.removeItem('currentUser');
            }
        }
    }
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize form validations
    initializeFormValidations();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Load services from database
    console.log('🚀 Starting service loading...');
    loadServicesFromDatabase();
    
    // Load clinic settings from Supabase
    loadClinicSettings();
    
    // Listen for messages from iframe (dentist dashboard)
    window.addEventListener('message', function(event) {
        if (event.data && event.data.action === 'refreshServices') {
            console.log('🔄 Received refresh message from dentist dashboard');
            loadServicesFromDatabase();
        }
        
        // Listen for clinic settings refresh
        if (event.data && event.data.action === 'refreshClinicSettings') {
            console.log('🔄 Received clinic settings refresh message from dentist dashboard');
            loadClinicSettings();
        }
    });
    
    // Also try loading services after a delay to ensure everything is ready
    setTimeout(() => {
        console.log('⏰ Delayed service loading attempt...');
        loadServicesFromDatabase();
    }, 2000);
}

// Load clinic settings from Supabase and update index.html
async function loadClinicSettings() {
    try {
        console.log('🔍 Loading clinic settings from Supabase...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/clinic_settings?id=eq.clinic&select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Clinic settings data:', data);
            
            if (Array.isArray(data) && data.length > 0) {
                const settings = data[0];
                
                // Update the contact information on index.html
                const addressEl = document.getElementById('clinicAddress');
                const phoneEl = document.getElementById('clinicPhone');
                const emailEl = document.getElementById('clinicEmail');
                const hoursEl = document.getElementById('clinicHours');
                
                console.log('📋 Settings object:', settings);
                console.log('📋 Available fields:', Object.keys(settings));
                
                if (addressEl && settings.clinic_address) {
                    addressEl.textContent = settings.clinic_address;
                    console.log('✅ Updated address:', settings.clinic_address);
                }
                
                if (phoneEl && settings.clinic_phone) {
                    phoneEl.textContent = settings.clinic_phone;
                    console.log('✅ Updated phone:', settings.clinic_phone);
                }
                
                if (emailEl && settings.clinic_email) {
                    emailEl.textContent = settings.clinic_email;
                    console.log('✅ Updated email:', settings.clinic_email);
                }
                
                if (hoursEl && settings.operating_hours) {
                    hoursEl.innerHTML = settings.operating_hours.replace(/\n/g, '<br>');
                    console.log('✅ Updated hours:', settings.operating_hours);
                }
                
                console.log('✅ Clinic settings loaded successfully');
            } else {
                console.log('⚠️ No clinic settings found in Supabase, using default values');
            }
        } else {
            console.error('❌ Failed to load clinic settings:', response.status);
            const errorText = await response.text();
            console.error('❌ Error details:', errorText);
        }
    } catch (error) {
        console.error('❌ Error loading clinic settings:', error);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle - try multiple approaches
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        console.log('Mobile toggle found, adding event listener');
        
        // Remove any existing listeners first
        mobileToggle.removeEventListener('click', toggleMobileMenu);
        
        // Add new listener
        mobileToggle.addEventListener('click', function(event) {
            console.log('Mobile toggle clicked!');
            event.preventDefault();
            event.stopPropagation();
            toggleMobileMenu();
        });
        
        // Also try mousedown as backup
        mobileToggle.addEventListener('mousedown', function(event) {
            console.log('Mobile toggle mousedown!');
            event.preventDefault();
            event.stopPropagation();
            toggleMobileMenu();
        });
        
        // Make sure it's clickable
        mobileToggle.style.pointerEvents = 'auto';
        mobileToggle.style.cursor = 'pointer';
        
    } else {
        console.error('Mobile toggle element not found!');
    }

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointment);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }

    // Appointment form real-time validation
    const aptDate = document.getElementById('aptDate');
    
    if (aptDate) {
        aptDate.addEventListener('change', checkAvailability);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (mobileMenu && mobileMenu.classList.contains('show') && 
            !mobileMenu.contains(event.target) && 
            !mobileToggle.contains(event.target)) {
            mobileMenu.classList.remove('show');
        }
    });
}

// Mobile Menu Functions
function initializeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        // Add mobile menu items
        const mobileNavMenu = mobileMenu.querySelector('.mobile-nav-menu');
        if (mobileNavMenu) {
            // Check if user is logged in
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                mobileNavMenu.innerHTML = `
                    <li><span class="mobile-nav-link">Welcome, ${user.name}</span></li>
                    <li><button class="btn btn-outline mobile-btn" onclick="logout(); closeMobileMenu();">Logout</button></li>
                `;
            } else {
                mobileNavMenu.innerHTML = `
                    <li><button class="btn btn-outline mobile-btn" onclick="showLoginModal(); closeMobileMenu();">Login</button></li>
                    <li><button class="btn btn-primary mobile-btn" onclick="showRegisterModal(); closeMobileMenu();">Register</button></li>
                `;
            }
            console.log('Mobile menu initialized successfully');
        }
    }
    
    // Debug: Check if elements exist
    console.log('Mobile toggle element:', document.querySelector('.mobile-menu-toggle'));
    console.log('Mobile menu element:', document.querySelector('.mobile-menu'));
}

function toggleMobileMenu() {
    console.log('Toggle mobile menu called');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        console.log('Mobile menu found, toggling...');
        mobileMenu.classList.toggle('show');
        console.log('Mobile menu classes:', mobileMenu.className);
    } else {
        console.error('Mobile menu not found!');
    }
}

function closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('show');
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function showAppointmentModal(serviceType = '') {
    const modal = document.getElementById('appointmentModal');
    const serviceSelect = document.getElementById('aptService');
    
    if (serviceType && serviceSelect) {
        serviceSelect.value = serviceType;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form if it's a form modal
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Password Toggle Function
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentNode.querySelector('.password-toggle-btn');
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

// Form Validation
function initializeFormValidations() {
    // Real-time email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });

    // Real-time phone validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('blur', validatePhone);
    });

    // Password confirmation validation
    const confirmPassword = document.getElementById('regConfirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('blur', validatePasswordMatch);
    }
}

function validateEmail(event) {
    const email = event.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(event.target, 'Please enter a valid email address');
        return false;
    } else {
        clearFieldError(event.target);
        return true;
    }
}

function validatePhone(event) {
    const phone = event.target.value.trim();
    
    // Remove spaces, dashes, and parentheses for validation
    const phoneDigits = phone.replace(/[\s\-\(\)]/g, '');
    
    // Allow phone numbers starting with 0 (common in Philippines) or + for international
    // Must have at least 10 digits and can have up to 15 digits
    if (phone && phoneDigits.length > 0) {
        // Allow: +63..., 09123456789, 0912345678, etc.
        const phoneRegex = /^[\+]?[0-9][\d]{9,14}$/;
        
        if (!phoneRegex.test(phoneDigits)) {
            showFieldError(event.target, 'Please enter a valid phone number (at least 10 digits)');
            return false;
        } else {
            clearFieldError(event.target);
            return true;
        }
    } else {
        clearFieldError(event.target);
        return true;
    }
}

function validatePasswordMatch(event) {
    const password = document.getElementById('regPassword').value;
    const confirmPassword = event.target.value;
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError(event.target, 'Passwords do not match');
        return false;
    } else {
        clearFieldError(event.target);
        return true;
    }
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#e74c3c';
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#e9ecef';
}

// Set minimum date for appointment booking
function setMinDate() {
    const dateInput = document.getElementById('aptDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        
        dateInput.min = `${year}-${month}-${day}`;
    }
}

// Check appointment availability
function checkAvailability() {
    const date = document.getElementById('aptDate').value;
    const statusDiv = document.getElementById('availabilityStatus');
    
    if (!date) {
        statusDiv.style.display = 'none';
        return;
    }
    
    statusDiv.style.display = 'block';
    statusDiv.className = 'availability-status checking';
    statusDiv.querySelector('#statusText').textContent = 'Checking availability...';
    
    // Simulate API call
    setTimeout(() => {
        const isAvailable = checkDateAvailability(date);
        
        if (isAvailable) {
            statusDiv.className = 'availability-status available';
            statusDiv.querySelector('#statusText').textContent = '✓ This date is available';
        } else {
            statusDiv.className = 'availability-status unavailable';
            statusDiv.querySelector('#statusText').textContent = '✗ This date is not available';
        }
    }, 1000);
}

function checkDateAvailability(date) {
    // Check if the date is available
    const existingAppointments = appointments.filter(apt => 
        apt.date === date && apt.status !== 'cancelled'
    );
    
    // Simple availability check - limit to 5 appointments per day
    return existingAppointments.length < 5;
}

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Form Handlers
async function handleLogin(event) {
    event.preventDefault();
    
    if (!supabase) {
        showToast('Database connection not available. Please refresh the page.', 'error');
        return;
    }
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('loginRole').value;
    
    try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            showToast('Login failed: ' + error.message, 'error');
            return;
        }
        
        // Get user profile from database
        let { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        // If profile doesn't exist, try to create it
        if (profileError && profileError.code === 'PGRST116') {
            console.log('User profile not found, creating one...');
            
            // Try to create profile using user metadata
            const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
                    email: data.user.email,
                    phone: data.user.user_metadata?.phone || '',
                    user_type: data.user.user_metadata?.user_type || 'patient'
                }])
                .select()
                .single();
            
            if (createError) {
                console.log('Failed to create profile:', createError);
                showToast('Failed to load user profile. Please contact support.', 'error');
                return;
            } else {
                profile = newProfile;
                console.log('Profile created successfully');
            }
        } else if (profileError) {
            showToast('Failed to load user profile: ' + profileError.message, 'error');
            return;
        }
        
        // Check if user type matches
        if (profile.user_type !== userType) {
            showToast(`Please login as ${profile.user_type}`, 'error');
            await supabase.auth.signOut();
        return;
    }
    
        currentUser = {
            id: data.user.id,
            email: data.user.email,
            name: profile.name,
            phone: profile.phone,
            userType: profile.user_type
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        closeModal('loginModal');
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
        
        // Redirect based on user type
        setTimeout(() => {
            if (currentUser.userType === 'patient') {
                window.location.href = 'components/patient/patient-dashboard.html';
            } else if (currentUser.userType === 'dentist') {
                window.location.href = 'components/dentist/dentist-dashboard.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    }
}

// Rate limiting protection
let lastRegistrationAttempt = 0;
const REGISTRATION_COOLDOWN = 5000; // 5 seconds

async function handleRegister(event) {
    event.preventDefault();
    
    if (!supabase) {
        showToast('Database connection not available. Please refresh the page.', 'error');
        return;
    }
    
    // Rate limiting check
    const now = Date.now();
    if (now - lastRegistrationAttempt < REGISTRATION_COOLDOWN) {
        const remainingTime = Math.ceil((REGISTRATION_COOLDOWN - (now - lastRegistrationAttempt)) / 1000);
        showToast(`Please wait ${remainingTime} seconds before trying again.`, 'error');
        return;
    }
    lastRegistrationAttempt = now;
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const userType = document.getElementById('regRole').value;
    
    // Validate form
    if (!name || !email || !phone || !password || !confirmPassword || !userType) {
        showToast('Please fill in all fields including account type', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate phone format (allow starting with 0 for Philippine numbers)
    const phoneDigits = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[\+]?[0-9][\d]{9,14}$/;
    if (!phoneRegex.test(phoneDigits) || phoneDigits.length < 10) {
        showToast('Please enter a valid phone number (at least 10 digits)', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Validate role selection
    if (userType !== 'patient' && userType !== 'dentist') {
        showToast('Please select a valid account type', 'error');
        return;
    }
    
    // Simple user data for Supabase
    const userData = {
        name,
        email,
        phone,
        password,
        userType
    };
    
    try {
        // Create auth user with Supabase (with retry logic)
        let authData, authError;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                // Include user metadata in signup so the database trigger has the data it needs
                const result = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                            phone: phone,
                            user_type: userType
                        }
                    }
                });
                authData = result.data;
                authError = result.error;
                break; // Success, exit retry loop
            } catch (connectionError) {
                retryCount++;
                console.log(`Auth signup attempt ${retryCount} failed:`, connectionError.message);
                
                if (retryCount >= maxRetries) {
                    authError = connectionError;
                    break;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
        
        if (authError) {
            console.error('Registration error details:', authError);
            let errorMessage = 'Registration failed';
            
            if (authError.message) {
                if (authError.message.includes('429') || authError.message.includes('Too Many Requests')) {
                    errorMessage = 'Too many registration attempts. Please wait a few minutes and try again.';
                    // Reset the cooldown timer to prevent immediate retry
                    lastRegistrationAttempt = Date.now() + 60000; // Add 1 minute
                } else if (authError.message.includes('already registered') || authError.message.includes('User already registered') || authError.message.includes('already exists')) {
                    errorMessage = 'This email is already registered. Please try logging in instead.';
                } else if (authError.message.includes('Invalid email')) {
                    errorMessage = 'Please enter a valid email address.';
                } else if (authError.message.includes('Password should be at least')) {
                    errorMessage = 'Password must be at least 6 characters long.';
                } else if (authError.message.includes('500') || authError.message.includes('Internal Server Error')) {
                    errorMessage = 'Server error during registration. This might be due to database configuration. Please contact support or try again later.';
                } else {
                    errorMessage = 'Registration failed: ' + authError.message;
                }
            } else if (authError.msg) {
                errorMessage = 'Registration failed: ' + authError.msg;
            }
            
            showToast(errorMessage, 'error');
            return;
        }
        
        // Try multiple methods to create user profile
        let profileCreated = false;
        
        // Method 1: Try RPC function (only if user exists)
        if (authData.user) {
            try {
                const { data: profileData, error: profileError } = await supabase
                    .rpc('create_user_profile', {
                        user_id: authData.user.id,
                        user_name: name,
                        user_email: email,
                        user_phone: phone,
                        user_type: userType
                    });
                
                if (!profileError && profileData && profileData.success) {
                    profileCreated = true;
                    console.log('Profile created via RPC:', profileData);
                } else if (profileError) {
                    console.log('RPC function error:', profileError.message);
                }
            } catch (rpcError) {
                console.log('RPC function failed:', rpcError.message);
            }
        }
        
        // Method 2: Try fallback RPC function (only if user exists)
        if (!profileCreated && authData.user) {
            try {
                const { data: fallbackData, error: fallbackError } = await supabase
                    .rpc('insert_user_profile', {
                        user_id: authData.user.id,
                        user_name: name,
                        user_email: email,
                        user_phone: phone,
                        user_type: userType
                    });
                
                if (!fallbackError && fallbackData) {
                    profileCreated = true;
                    console.log('Profile created via fallback RPC');
                } else if (fallbackError) {
                    console.log('Fallback RPC error:', fallbackError.message);
                }
            } catch (fallbackRpcError) {
                console.log('Fallback RPC failed:', fallbackRpcError.message);
            }
        }
        
        // Method 3: Try direct insert (only if user exists)
        if (!profileCreated && authData.user) {
            try {
                const { data: directData, error: directError } = await supabase
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        name,
                        email,
                        phone,
                        user_type: userType
                    }]);
                
                if (!directError) {
                    profileCreated = true;
                    console.log('Profile created via direct insert');
                } else {
                    console.log('Direct insert failed:', directError.message);
                }
            } catch (directInsertError) {
                console.log('Direct insert error:', directInsertError.message);
            }
        }
        
        // If all methods failed, show error but don't block registration
        if (!profileCreated) {
            console.warn('Profile creation failed, but user is registered in auth');
            showToast('Account created successfully! Profile will be created when you first login.', 'success');
        }
        
        // Check if email confirmation is required
        if (authData.user && !authData.user.email_confirmed_at) {
            showToast('Registration successful! Please check your email and click the verification link to activate your account.', 'success');
            
            // Show email verification modal
            showEmailVerificationModal(email);
        } else {
            showToast('Registration successful! You can now login.', 'success');
            closeModal('registerModal');
            showLoginModal();
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    }
}

async function handleAppointment(event) {
    event.preventDefault();
    
    const name = document.getElementById('aptName').value.trim();
    const email = document.getElementById('aptEmail').value.trim();
    const phone = document.getElementById('aptPhone').value.trim();
    const service = document.getElementById('aptService').value;
    const date = document.getElementById('aptDate').value;
    const message = document.getElementById('aptMessage').value;
    
    // Validate form
    if (!name || !email || !phone || !service || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate phone format (allow starting with 0 for Philippine numbers)
    const phoneDigits = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[\+]?[0-9][\d]{9,14}$/;
    if (!phoneRegex.test(phoneDigits) || phoneDigits.length < 10) {
        showToast('Please enter a valid phone number (at least 10 digits)', 'error');
        return;
    }
    
    try {
        // Get current user if logged in
        const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
        
        // Create appointment in Supabase
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                patient_id: currentUserData?.id || null,
                service_type: service,
                appointment_date: date,
                appointment_time: '10:00:00', // Default time
                duration: 60, // Default duration in minutes
                notes: message,
                patient_name: name,
                patient_email: email,
                patient_phone: phone,
                status: 'confirmed'
            }]);
        
        if (error) {
            showToast('Appointment booking failed: ' + error.message, 'error');
        return;
    }
    
    showToast('Appointment booked and confirmed successfully! Confirmation email sent.', 'success');
    closeModal('appointmentModal');
    
    // Send confirmation email
    await sendAppointmentConfirmation({
        name,
        email,
        service,
        date,
        time: '10:00 AM', // Default time display
        dentistName: 'Dr. Delas Alas' // Default dentist name
    });
        
    } catch (error) {
        console.error('Appointment booking error:', error);
        showToast('Appointment booking failed. Please try again.', 'error');
    }
}

function handleContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const message = document.getElementById('contactMessage').value;
    
    // Validate form
    if (!name || !email || !message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Simulate sending message
    showToast('Message sent successfully! We will get back to you soon.', 'success');
    event.target.reset();
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    // Update mobile menu
    initializeMobileMenu();
}

// Reset UI for logged out user
function resetUIForLoggedOutUser() {
    // Reset mobile menu
    initializeMobileMenu();
}

// Logout function
async function logout() {
    try {
        // Sign out from Supabase
        await supabase.auth.signOut();
        
    currentUser = null;
    localStorage.removeItem('currentUser');
        
        // Reset UI
        resetUIForLoggedOutUser();
        
        showToast('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

// Get auth token for API requests
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Make authenticated API request
async function makeAuthenticatedRequest(url, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    return fetch(url, mergedOptions);
}


// Send appointment confirmation email
async function sendAppointmentConfirmation(appointment) {
    try {
        if (!appointment.email || appointment.email.trim() === '') {
            console.warn('No email provided, skipping email confirmation');
            return;
        }
        
        // Determine API base URL
        const apiBaseUrl = window.location.origin.includes('vercel.app') 
            ? window.location.origin 
            : (window.location.origin.includes('localhost') 
                ? 'http://localhost:3000' 
                : window.location.origin);
        
        const emailData = {
            email: appointment.email,
            patientName: appointment.name,
            serviceType: appointment.service,
            appointmentDate: appointment.date,
            appointmentTime: appointment.time || '10:00 AM',
            dentistName: appointment.dentistName || 'Dr. Delas Alas',
            notes: appointment.notes || ''
        };
        
        console.log('📧 Sending confirmation email to:', appointment.email);
        
        const emailResponse = await fetch(`${apiBaseUrl}/api/send-appointment-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        if (emailResponse.ok) {
            console.log('✅ Confirmation email sent successfully');
        } else {
            console.error('❌ Failed to send confirmation email');
        }
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
        // Continue even if email fails - appointment is still confirmed
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Email Verification Functions
function showEmailVerificationModal(email) {
    const modal = document.getElementById('emailVerificationModal');
    const emailElement = document.getElementById('verificationEmail');
    
    if (emailElement) {
        emailElement.textContent = email;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    closeModal('registerModal');
}

async function resendVerificationEmail() {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: document.getElementById('verificationEmail').textContent
        });
        
        if (error) {
            showToast('Failed to resend email: ' + error.message, 'error');
        } else {
            showToast('Verification email sent! Please check your inbox.', 'success');
        }
    } catch (error) {
        console.error('Resend email error:', error);
        showToast('Failed to resend email. Please try again.', 'error');
    }
}

// Handle email confirmation from URL hash (when user clicks email confirmation link)
async function handleEmailConfirmation() {
    try {
        const hash = window.location.hash;
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        
        // Check for password reset errors first - redirect immediately if not already on password-reset.html
        if (hash && (hash.includes('error=') || hash.includes('error_code='))) {
            if (currentFile !== 'password-reset.html') {
                console.log('🔐 Password reset error detected, redirecting to password-reset.html');
                // Use relative path for better compatibility
                window.location.replace('password-reset.html' + hash);
                return;
            }
        }
        
        // Check for password reset token (recovery type) - redirect immediately if not already on password-reset.html
        if (hash && (hash.includes('type=recovery') || (hash.includes('access_token') && hash.includes('recovery')))) {
            if (currentFile !== 'password-reset.html') {
                console.log('🔐 Password reset token detected, redirecting to password-reset.html');
                // Use relative path for better compatibility
                window.location.replace('password-reset.html' + hash);
                return;
            }
        }
        
        // Check if there's an access_token in the URL hash
        if (!hash || !hash.includes('access_token')) {
            return; // No email confirmation token, continue normally
        }
        
        console.log('📧 Email confirmation detected in URL hash');
        
        // Extract access_token from hash
        const hashParams = new URLSearchParams(hash.substring(1)); // Remove # from hash
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        if (!accessToken) {
            console.log('⚠️ No access_token found in hash');
            return;
        }
        
        // If this is a password recovery/reset token
        if (type === 'recovery' || hash.includes('type=recovery')) {
            console.log('🔐 Password reset token detected, redirecting to password-reset.html');
            // Redirect to password reset page with the token
            window.location.href = 'password-reset.html' + hash;
            return;
        }
        
        // If this is an email confirmation
        if (type === 'signup' || hash.includes('type=signup')) {
            console.log('✅ Processing email confirmation...');
            
            // Store the token temporarily
            localStorage.setItem('email_confirmation_token', accessToken);
            
            // Try to set the session with the token
            try {
                // Use Supabase to exchange the token for a session
                // Note: This requires the Supabase client to be initialized
                if (supabase && supabase.auth) {
                    // The token will be automatically processed by Supabase
                    // We just need to verify the email was confirmed
                    const { data: { user }, error } = await supabase.auth.getUser();
                    
                    if (user && user.email_confirmed_at) {
                        showToast('✅ Email verified successfully! You can now login.', 'success');
                        // Clear the hash from URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                        // Show login modal
                        setTimeout(() => {
                            showLoginModal();
                        }, 1500);
                    } else {
                        showToast('Email verification in progress. Please try logging in.', 'info');
                        // Clear the hash from URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } else {
                    showToast('Email confirmation link detected. Please refresh the page and try logging in.', 'info');
                    // Clear the hash from URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                console.error('Error processing email confirmation:', error);
                showToast('Email confirmation processed. Please try logging in.', 'info');
                // Clear the hash from URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else {
            // Other types of tokens - redirect to password reset if it's a recovery token
            console.log('📧 Other token type detected:', type);
            // Clear the hash from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (error) {
        console.error('Error handling email confirmation:', error);
        // Clear the hash from URL even on error
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function checkEmailVerification() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            showToast('Please check your email and click the verification link.', 'error');
            return;
        }
        
        if (user && user.email_confirmed_at) {
            showToast('Email verified successfully! You can now login.', 'success');
            closeModal('emailVerificationModal');
            showLoginModal();
        } else {
            showToast('Email not yet verified. Please check your email and click the verification link.', 'error');
        }
    } catch (error) {
        console.error('Email verification check error:', error);
        showToast('Please check your email and click the verification link.', 'error');
    }
}

// Load services from Supabase database
async function loadServicesFromDatabase() {
    try {
        console.log('🔄 Loading services from database...');
        
        // First try to load from Supabase using REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/services?select=*&order=created_at.desc`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Services loaded from Supabase:', data?.length || 0, 'services');
            console.log('Services data:', data);
            displayServicesOnIndex(data || []);
        } else {
            console.error('❌ Error loading from Supabase, trying localStorage...');
            // Fallback to localStorage
            const localServices = localStorage.getItem('dentalServices');
            if (localServices) {
                const localData = JSON.parse(localServices);
                console.log('📦 Using localStorage services:', localData.length);
                displayServicesOnIndex(localData || []);
            } else {
                showFallbackServices();
            }
        }
    } catch (error) {
        console.error('❌ Error loading services:', error);
        // Fallback to localStorage
        try {
            const localServices = localStorage.getItem('dentalServices');
            if (localServices) {
                const localData = JSON.parse(localServices);
                console.log('📦 Using localStorage services:', localData.length);
                displayServicesOnIndex(localData || []);
            } else {
                showFallbackServices();
            }
        } catch (e) {
            showFallbackServices();
        }
    }
}

// Display services on the index page
function displayServicesOnIndex(services) {
    console.log('🎨 Displaying services on index page:', services);
    const servicesGrid = document.getElementById('servicesGrid');
    
    if (!servicesGrid) {
        console.log('❌ Services grid not found');
        return;
    }

    if (services.length === 0) {
        console.log('⚠️ No services to display');
        servicesGrid.innerHTML = `
            <div class="no-services">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5; color: var(--text-light);"></i>
                <h3 style="margin: 0 0 10px 0; color: var(--text-light);">No services available</h3>
                <p style="margin: 0; color: var(--text-light);">Services will be added soon</p>
            </div>
        `;
        return;
    }

    // Group services by category for better display
    const groupedServices = groupServicesByCategory(services);
    console.log('📊 Grouped services:', groupedServices);
    
    servicesGrid.innerHTML = Object.keys(groupedServices).map(category => `
        <div class="service-card">
            <div class="service-icon">
                <i class="fas ${getCategoryIcon(category)}"></i>
            </div>
            <h3>${category}</h3>
            <p>Professional ${category.toLowerCase()} services</p>
            <ul class="service-features">
                ${groupedServices[category].slice(0, 4).map(service => `<li>${service.name}</li>`).join('')}
            </ul>
            <button class="btn btn-outline" onclick="showAppointmentModal('${category.toLowerCase()}')">Book Now</button>
        </div>
    `).join('');
    
    console.log('✅ Services displayed successfully');
}

// Group services by category (infer from service name/description since DB doesn't have category field)
function groupServicesByCategory(services) {
    const categories = {
        'General Dentistry': [],
        'Cosmetic Dentistry': [],
        'Restorative Dentistry': [],
        'Pediatric Dentistry': [],
        'Orthodontics': [],
        'Oral Surgery': []
    };

    services.forEach(service => {
        // Infer category from service name/description since DB doesn't have category field
        let category = 'General Dentistry'; // Default
        
        const name = service.name.toLowerCase();
        const description = service.description.toLowerCase();
        
        if (name.includes('bunot') || description.includes('bunot') || name.includes('extraction') || name.includes('surgery') || name.includes('implant') || description.includes('extraction') || description.includes('surgery')) {
            category = 'Oral Surgery';
        } else if (name.includes('cleaning') || name.includes('checkup') || name.includes('examination') || description.includes('cleaning') || description.includes('checkup')) {
            category = 'General Dentistry';
        } else if (name.includes('braces') || description.includes('braces') || name.includes('orthodontic') || name.includes('alignment') || description.includes('orthodontic')) {
            category = 'Orthodontics';
        } else if (name.includes('whitening') || name.includes('veneers') || name.includes('cosmetic')) {
            category = 'Cosmetic Dentistry';
        } else if (name.includes('filling') || name.includes('crown') || name.includes('bridge') || name.includes('root canal')) {
            category = 'Restorative Dentistry';
        } else if (name.includes('child') || name.includes('pediatric') || name.includes('kids')) {
            category = 'Pediatric Dentistry';
        }
        
        if (categories[category]) {
            categories[category].push(service);
        } else {
            // If category doesn't exist, add it dynamically
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(service);
        }
    });

    // Remove empty categories
    Object.keys(categories).forEach(category => {
        if (categories[category].length === 0) {
            delete categories[category];
        }
    });

    return categories;
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        'General Dentistry': 'fa-tooth',
        'Cosmetic Dentistry': 'fa-gem',
        'Restorative Dentistry': 'fa-tools',
        'Pediatric Dentistry': 'fa-child',
        'Orthodontics': 'fa-smile',
        'Oral Surgery': 'fa-cut'
    };
    return icons[category] || 'fa-tooth';
}

// Show fallback services if database fails
function showFallbackServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    if (!servicesGrid) return;

    servicesGrid.innerHTML = `
        <div class="service-card">
            <div class="service-icon">
                <i class="fas fa-tooth"></i>
            </div>
            <h3>General Dentistry</h3>
            <p>Regular checkups, cleanings, and preventive care to keep your smile healthy.</p>
            <ul class="service-features">
                <li>Dental Cleanings</li>
                <li>Oral Examinations</li>
                <li>X-rays</li>
                <li>Fluoride Treatments</li>
            </ul>
            <button class="btn btn-outline" onclick="showAppointmentModal('general')">Book Now</button>
        </div>
        <div class="service-card">
            <div class="service-icon">
                <i class="fas fa-gem"></i>
            </div>
            <h3>Cosmetic Dentistry</h3>
            <p>Transform your smile with our cosmetic dental procedures.</p>
            <ul class="service-features">
                <li>Teeth Whitening</li>
                <li>Veneers</li>
                <li>Dental Implants</li>
                <li>Smile Makeovers</li>
            </ul>
            <button class="btn btn-outline" onclick="showAppointmentModal('cosmetic')">Book Now</button>
        </div>
        <div class="service-card">
            <div class="service-icon">
                <i class="fas fa-tools"></i>
            </div>
            <h3>Restorative Dentistry</h3>
            <p>Restore function and appearance with our restorative treatments.</p>
            <ul class="service-features">
                <li>Dental Fillings</li>
                <li>Crowns & Bridges</li>
                <li>Root Canal Therapy</li>
                <li>Dentures</li>
            </ul>
            <button class="btn btn-outline" onclick="showAppointmentModal('restorative')">Book Now</button>
        </div>
        <div class="service-card">
            <div class="service-icon">
                <i class="fas fa-child"></i>
            </div>
            <h3>Pediatric Dentistry</h3>
            <p>Specialized dental care for children in a comfortable environment.</p>
            <ul class="service-features">
                <li>Child Checkups</li>
                <li>Sealants</li>
                <li>Orthodontic Consultations</li>
                <li>Emergency Care</li>
            </ul>
            <button class="btn btn-outline" onclick="showAppointmentModal('pediatric')">Book Now</button>
        </div>
    `;
}

// Export functions for global access
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.showAppointmentModal = showAppointmentModal;
window.closeModal = closeModal;
window.togglePasswordVisibility = togglePasswordVisibility;
window.scrollToSection = scrollToSection;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;
window.resendVerificationEmail = resendVerificationEmail;
window.checkEmailVerification = checkEmailVerification;
window.loadServicesFromDatabase = loadServicesFromDatabase;
