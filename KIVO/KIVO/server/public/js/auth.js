// Authentication JavaScript - Client-side Supabase integration
// IMPORTANT: Uses only anon key, never exposes service role key

// Initialize Supabase client with anon key
const supabaseUrl = window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize Supabase client (global variable)
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Authentication state management
let currentUser = null;
let isAuthenticated = false;

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

async function initializeAuth() {
    try {
        // Check if user is already logged in
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return;
        }
        
        if (session && session.user) {
            currentUser = session.user;
            isAuthenticated = true;
            
            // Store token for API requests
            localStorage.setItem('supabase_token', session.access_token);
            
            // Get user profile to check admin status
            await fetchUserProfile();
            
            // Update UI if we're not on auth page
            if (!window.location.pathname.includes('/auth')) {
                updateAuthenticationUI();
            }
        } else {
            // Clear any stale tokens
            localStorage.removeItem('supabase_token');
        }
        
        // Listen for auth state changes
        supabaseClient.auth.onAuthStateChange(handleAuthStateChange);
        
    } catch (error) {
        console.error('Error initializing auth:', error);
    }
}

async function handleAuthStateChange(event, session) {
    console.log('Auth state change:', event, session?.user?.email);
    
    switch (event) {
        case 'SIGNED_IN':
            currentUser = session.user;
            isAuthenticated = true;
            localStorage.setItem('supabase_token', session.access_token);
            await fetchUserProfile();
            updateAuthenticationUI();
            break;
            
        case 'SIGNED_OUT':
            currentUser = null;
            isAuthenticated = false;
            localStorage.removeItem('supabase_token');
            updateAuthenticationUI();
            // Redirect to home if on protected page
            if (window.location.pathname.includes('/admin')) {
                window.location.href = '/';
            }
            break;
            
        case 'TOKEN_REFRESHED':
            if (session) {
                localStorage.setItem('supabase_token', session.access_token);
            }
            break;
    }
}

async function fetchUserProfile() {
    if (!currentUser) return;
    
    try {
        const token = localStorage.getItem('supabase_token');
        if (!token) return;
        
        // Fetch user profile from our API
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                currentUser.profile = data.data;
            }
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function updateAuthenticationUI() {
    // Update navigation
    const authSection = document.getElementById('auth-section');
    const userMenu = document.getElementById('user-menu');
    
    if (authSection && userMenu) {
        if (isAuthenticated && currentUser) {
            authSection.style.display = 'none';
            userMenu.style.display = 'block';
            
            // Update user email
            const emailElement = document.querySelector('[data-testid="text-user-email"]');
            if (emailElement) {
                emailElement.textContent = currentUser.email;
            }
            
            // Show/hide admin badge and link
            const adminBadge = document.querySelector('[data-testid="badge-admin"]');
            const adminLink = document.querySelector('[data-testid="link-admin"]');
            
            const isAdmin = currentUser.profile?.is_admin || false;
            
            if (adminBadge) {
                adminBadge.style.display = isAdmin ? 'inline' : 'none';
            }
            if (adminLink) {
                adminLink.style.display = isAdmin ? 'block' : 'none';
            }
        } else {
            authSection.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }
}

// Logout function
async function handleLogout() {
    try {
        showNotification('Cerrando sesión...', 'info');
        
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        showNotification('Sesión cerrada exitosamente', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
}

// Check if user is admin
function isUserAdmin() {
    return isAuthenticated && currentUser?.profile?.is_admin === true;
}

// Get current auth token
function getAuthToken() {
    return localStorage.getItem('supabase_token');
}

// Protected route checker
function requireAuth() {
    if (!isAuthenticated) {
        showNotification('Debes iniciar sesión para acceder a esta página', 'warning');
        window.location.href = '/auth';
        return false;
    }
    return true;
}

// Admin route checker
function requireAdmin() {
    if (!requireAuth()) return false;
    
    if (!isUserAdmin()) {
        showNotification('Necesitas permisos de administrador para acceder a esta página', 'error');
        window.location.href = '/';
        return false;
    }
    return true;
}

// Notification system
function showNotification(message, type = 'info') {
    const toastElement = document.getElementById('notification-toast');
    if (!toastElement) return;
    
    const toastBody = toastElement.querySelector('[data-testid="text-toast-message"]');
    const toastTime = toastElement.querySelector('[data-testid="text-toast-time"]');
    
    if (toastBody) {
        toastBody.textContent = message;
    }
    
    if (toastTime) {
        toastTime.textContent = 'ahora';
    }
    
    // Update toast header based on type
    const toastHeader = toastElement.querySelector('.toast-header');
    if (toastHeader) {
        toastHeader.className = `toast-header bg-${getBootstrapColorClass(type)} text-white`;
    }
    
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: type === 'error' ? 5000 : 3000
    });
    
    toast.show();
}

function getBootstrapColorClass(type) {
    switch (type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'primary';
    }
}

// API request helper with auth
async function apiRequest(method, url, data = null) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            // Token expired or invalid
            await handleLogout();
            throw new Error('Session expired. Please login again.');
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Utility function to check authentication status
function getAuthStatus() {
    return {
        isAuthenticated,
        user: currentUser,
        isAdmin: isUserAdmin(),
        token: getAuthToken()
    };
}

// Export functions for global use
window.supabaseClient = supabaseClient;
window.handleLogout = handleLogout;
window.isUserAdmin = isUserAdmin;
window.getAuthToken = getAuthToken;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.showNotification = showNotification;
window.apiRequest = apiRequest;
window.getAuthStatus = getAuthStatus;

// Debug helper (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.authDebug = {
        getCurrentUser: () => currentUser,
        getAuthStatus: getAuthStatus,
        forceLogout: handleLogout
    };
}
