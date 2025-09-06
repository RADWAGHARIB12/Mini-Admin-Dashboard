// Dashboard specific JavaScript
$(document).ready(function() {
    // Initialize dashboard
    initializeDashboard();
});

// Dashboard initialization
function initializeDashboard() {
    // Load dashboard statistics
    loadDashboardStats();
    
    // Setup dashboard event listeners
    setupDashboardEvents();
}

// Setup dashboard event listeners
function setupDashboardEvents() {
    // Refresh data button
    window.refreshData = function() {
        loadDashboardStats();
        toastr.info('Dashboard data refreshed', 'Info');
    };
}

// Load and display dashboard statistics
async function loadDashboardStats() {
    try {
        showLoader();
        
        // Fetch all data concurrently
        const [usersResult, postsResult, commentsResult] = await Promise.all([
            fetchUsers(),
            fetchPosts(),
            fetchComments()
        ]);
        
        // Check if all API calls were successful
        if (!usersResult.success || !postsResult.success || !commentsResult.success) {
            throw new Error('Failed to fetch some data');
        }
        
        const users = usersResult.data;
        const posts = postsResult.data;
        const comments = commentsResult.data;
        const localPosts = getLocalPosts();
        const favoriteUsers = getFavoriteUsers();
        
        // Calculate statistics
        const stats = {
            totalUsers: users.length,
            totalPosts: posts.length + localPosts.length,
            totalComments: comments.length,
            favoriteUsers: favoriteUsers.length
        };
        
        // Update dashboard statistics
        updateDashboardStats(stats);
        
        // Animate statistics cards
        animateStatsCards();
        
    } catch (error) {
        handleError(error, 'Loading dashboard statistics');
        
        // Show default values on error
        updateDashboardStats({
            totalUsers: 0,
            totalPosts: 0,
            totalComments: 0,
            favoriteUsers: 0
        });
    } finally {
        hideLoader();
    }
}

// Update dashboard statistics display
function updateDashboardStats(stats) {
    // Animate counter updates
    animateCounter('#totalUsers', stats.totalUsers);
    animateCounter('#totalPosts', stats.totalPosts);
    animateCounter('#totalComments', stats.totalComments);
    animateCounter('#favoriteUsers', stats.favoriteUsers);
}

// Animate counter with counting effect
function animateCounter(selector, targetValue) {
    const element = $(selector);
    const currentValue = parseInt(element.text()) || 0;
    
    if (currentValue === targetValue) return;
    
    const duration = 1000; // 1 second
    const steps = 30;
    const stepValue = (targetValue - currentValue) / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.round(currentValue + (stepValue * currentStep));
        
        if (currentStep >= steps) {
            element.text(targetValue);
            clearInterval(timer);
        } else {
            element.text(newValue);
        }
    }, stepDuration);
}

// Animate statistics cards on load
function animateStatsCards() {
    $('.stat-card').each(function(index) {
        const card = $(this);
        setTimeout(() => {
            animateElement(card, 'animate__pulse');
        }, index * 200);
    });
}

// Dashboard data refresh with visual feedback
async function refreshDashboardData() {
    try {
        // Add loading state to refresh button
        const refreshBtn = $('#refreshData');
        const originalText = refreshBtn.html();
        refreshBtn.html('<i class="fas fa-spinner fa-spin"></i> Refreshing...');
        refreshBtn.prop('disabled', true);
        
        // Reload statistics
        await loadDashboardStats();
        
        // Show success message
        toastr.success('Dashboard data refreshed successfully', 'Success');
        
        // Restore button
        refreshBtn.html(originalText);
        refreshBtn.prop('disabled', false);
        
    } catch (error) {
        handleError(error, 'Refreshing dashboard data');
        
        // Restore button on error
        const refreshBtn = $('#refreshData');
        refreshBtn.html('<i class="fas fa-sync-alt"></i> Refresh');
        refreshBtn.prop('disabled', false);
    }
}

// Get dashboard insights
function getDashboardInsights() {
    const favoriteUsers = getFavoriteUsers();
    const localPosts = getLocalPosts();
    
    return {
        hasFavorites: favoriteUsers.length > 0,
        hasLocalPosts: localPosts.length > 0,
        favoriteCount: favoriteUsers.length,
        localPostCount: localPosts.length
    };
}

// Display dashboard insights
function displayDashboardInsights() {
    const insights = getDashboardInsights();
    
    if (insights.hasFavorites) {
        toastr.info(`You have ${insights.favoriteCount} favorite users`, 'Insight');
    }
    
    if (insights.hasLocalPosts) {
        toastr.info(`You have created ${insights.localPostCount} local posts`, 'Insight');
    }
}

// Export dashboard data
function exportDashboardData() {
    try {
        const favoriteUsers = getFavoriteUsers();
        const localPosts = getLocalPosts();
        
        const exportData = {
            favoriteUsers,
            localPosts,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        toastr.success('Dashboard data exported successfully', 'Success');
        
    } catch (error) {
        handleError(error, 'Exporting dashboard data');
    }
}

// Import dashboard data
function importDashboardData(file) {
    try {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate import data
                if (!importData.favoriteUsers || !importData.localPosts) {
                    throw new Error('Invalid import data format');
                }
                
                // Confirm import
                showConfirmation(
                    'This will replace your current favorites and local posts. Continue?',
                    function() {
                        // Import data
                        localStorage.setItem('favoriteUsers', JSON.stringify(importData.favoriteUsers));
                        localStorage.setItem('localPosts', JSON.stringify(importData.localPosts));
                        
                        // Refresh dashboard
                        loadDashboardStats();
                        
                        toastr.success('Dashboard data imported successfully', 'Success');
                    }
                );
                
            } catch (error) {
                handleError(error, 'Parsing import data');
            }
        };
        
        reader.readAsText(file);
        
    } catch (error) {
        handleError(error, 'Importing dashboard data');
    }
}

// Dashboard keyboard shortcuts
$(document).on('keydown', function(e) {
    // Ctrl/Cmd + R: Refresh dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshDashboardData();
    }
    
    // Ctrl/Cmd + E: Export data
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportDashboardData();
    }
});

// Auto-refresh dashboard every 5 minutes
setInterval(() => {
    if (document.visibilityState === 'visible') {
        loadDashboardStats();
    }
}, 5 * 60 * 1000);

// Refresh dashboard when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        loadDashboardStats();
    }
});

