// Main JavaScript file for common functionality
$(document).ready(function() {
    // Initialize the application
    initializeApp();
});

// Application initialization
function initializeApp() {
    // Configure Toastr
    configureToastr();
    
    // Initialize theme
    initializeTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loader after initialization
    setTimeout(hideLoader, 1000);
}

// Configure Toastr notifications
function configureToastr() {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    updateThemeIcon(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateThemeIcon(newTheme);
    
    // Show notification
    toastr.info(`Switched to ${newTheme} mode`, 'Theme Changed');
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Event listeners setup
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Modal close events
    setupModalEvents();
}

// Modal event handlers
function setupModalEvents() {
    // Close modal when clicking on close button or outside modal
    $(document).on('click', '.close, .modal', function(e) {
        if (e.target === this) {
            closeModal($(this).closest('.modal'));
        }
    });
    
    // Prevent modal from closing when clicking inside modal content
    $(document).on('click', '.modal-content', function(e) {
        e.stopPropagation();
    });
    
    // ESC key to close modal
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.modal:visible').each(function() {
                closeModal($(this));
            });
        }
    });
}

// Modal utilities
function showModal(modalId) {
    const modal = $(`#${modalId}`);
    modal.show();
    modal.find('.modal-content').removeClass('animate__zoomOut').addClass('animate__zoomIn');
}

function closeModal(modal) {
    const modalElement = modal instanceof jQuery ? modal : $(modal);
    modalElement.find('.modal-content').removeClass('animate__zoomIn').addClass('animate__zoomOut');
    setTimeout(() => {
        modalElement.hide();
    }, 300);
}

// Loader utilities
function showLoader() {
    $('#loader').removeClass('hidden');
}

function hideLoader() {
    $('#loader').addClass('hidden');
}

// API utilities
const API_BASE = 'https://jsonplaceholder.typicode.com';

// Generic API call function
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        showLoader();
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('API call failed:', error);
        toastr.error(`API call failed: ${error.message}`, 'Error');
        return { success: false, error: error.message };
    } finally {
        hideLoader();
    }
}

// Specific API functions
async function fetchUsers() {
    return await apiCall('/users');
}

async function fetchPosts() {
    return await apiCall('/posts');
}

async function fetchComments(postId = null) {
    const endpoint = postId ? `/comments?postId=${postId}` : '/comments';
    return await apiCall(endpoint);
}

async function fetchUser(userId) {
    return await apiCall(`/users/${userId}`);
}

async function fetchPost(postId) {
    return await apiCall(`/posts/${postId}`);
}

// Create new post (simulated)
async function createPost(postData) {
    return await apiCall('/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
    });
}

// Update post (simulated)
async function updatePost(postId, postData) {
    return await apiCall(`/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(postData)
    });
}

// Delete post (simulated)
async function deletePost(postId) {
    return await apiCall(`/posts/${postId}`, {
        method: 'DELETE'
    });
}

// LocalStorage utilities for favorites
function getFavoriteUsers() {
    const favorites = localStorage.getItem('favoriteUsers');
    return favorites ? JSON.parse(favorites) : [];
}

function addToFavorites(userId) {
    const favorites = getFavoriteUsers();
    if (!favorites.includes(userId)) {
        favorites.push(userId);
        localStorage.setItem('favoriteUsers', JSON.stringify(favorites));
        toastr.success('User added to favorites', 'Success');
        return true;
    }
    return false;
}

function removeFromFavorites(userId) {
    const favorites = getFavoriteUsers();
    const index = favorites.indexOf(userId);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favoriteUsers', JSON.stringify(favorites));
        toastr.info('User removed from favorites', 'Info');
        return true;
    }
    return false;
}

function isFavorite(userId) {
    return getFavoriteUsers().includes(userId);
}

// Local data management for posts (since API is read-only)
function getLocalPosts() {
    const localPosts = localStorage.getItem('localPosts');
    return localPosts ? JSON.parse(localPosts) : [];
}

function saveLocalPosts(posts) {
    localStorage.setItem('localPosts', JSON.stringify(posts));
}

function addLocalPost(post) {
    const localPosts = getLocalPosts();
    const newPost = {
        ...post,
        id: Date.now(), // Generate unique ID
        isLocal: true,
        createdAt: new Date().toISOString()
    };
    localPosts.unshift(newPost);
    saveLocalPosts(localPosts);
    return newPost;
}

function updateLocalPost(postId, updatedData) {
    const localPosts = getLocalPosts();
    const index = localPosts.findIndex(post => post.id === postId);
    if (index > -1) {
        localPosts[index] = { ...localPosts[index], ...updatedData };
        saveLocalPosts(localPosts);
        return localPosts[index];
    }
    return null;
}

function deleteLocalPost(postId) {
    const localPosts = getLocalPosts();
    const filteredPosts = localPosts.filter(post => post.id !== postId);
    saveLocalPosts(filteredPosts);
    return true;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation utilities
function animateElement(element, animationClass, callback) {
    const $element = $(element);
    $element.addClass(`animate__animated ${animationClass}`);
    
    $element.one('animationend', function() {
        $element.removeClass(`animate__animated ${animationClass}`);
        if (callback) callback();
    });
}

// Error handling
function handleError(error, context = 'Operation') {
    console.error(`${context} failed:`, error);
    toastr.error(`${context} failed. Please try again.`, 'Error');
}

// Success notification
function showSuccess(message, title = 'Success') {
    toastr.success(message, title);
}

// Info notification
function showInfo(message, title = 'Info') {
    toastr.info(message, title);
}

// Warning notification
function showWarning(message, title = 'Warning') {
    toastr.warning(message, title);
}

// Confirmation dialog
function showConfirmation(message, onConfirm, onCancel) {
    $('#confirmMessage').text(message);
    showModal('confirmModal');
    
    // Remove previous event listeners
    $('#confirmAction').off('click');
    $('#cancelAction').off('click');
    
    // Add new event listeners
    $('#confirmAction').on('click', function() {
        closeModal($('#confirmModal'));
        if (onConfirm) onConfirm();
    });
    
    $('#cancelAction').on('click', function() {
        closeModal($('#confirmModal'));
        if (onCancel) onCancel();
    });
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    toastr.error('An unexpected error occurred', 'Error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    toastr.error('An unexpected error occurred', 'Error');
    e.preventDefault();
});

