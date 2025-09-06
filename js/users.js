// Users management JavaScript
let usersTable;
let allUsers = [];
let currentUser = null;
let showingFavorites = false;

$(document).ready(function() {
    // Initialize users page
    initializeUsersPage();
});

// Initialize users page
function initializeUsersPage() {
    // Load users data
    loadUsers();
    
    // Setup event listeners
    setupUsersEvents();
}

// Setup users page event listeners
function setupUsersEvents() {
    // Refresh users button
    $('#refreshUsers').on('click', function() {
        loadUsers();
        toastr.info('Users data refreshed', 'Info');
    });
    
    // Show favorites toggle
    $('#showFavorites').on('click', toggleFavoritesView);
    
    // Modal events
    $('#closeModal, #closeUserModal').on('click', function() {
        closeModal($('#userModal'));
    });
    
    $('#saveUser').on('click', saveUserChanges);
    
    // Form submission
    $('#userForm').on('submit', function(e) {
        e.preventDefault();
        saveUserChanges();
    });
}

// Load and display users
async function loadUsers() {
    try {
        showLoader();
        
        const result = await fetchUsers();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        allUsers = result.data;
        
        // Initialize or refresh DataTable
        if (usersTable) {
            usersTable.destroy();
        }
        
        initializeUsersTable();
        
        // Update favorites button text
        updateFavoritesButton();
        
    } catch (error) {
        handleError(error, 'Loading users');
    } finally {
        hideLoader();
    }
}

// Initialize DataTables
function initializeUsersTable() {
    const tableData = showingFavorites ? getFavoriteUsersData() : allUsers;
    
    usersTable = $('#usersTable').DataTable({
        data: tableData,
        columns: [
            { 
                data: 'id',
                title: 'ID',
                width: '60px'
            },
            { 
                data: 'name',
                title: 'Name',
                render: function(data, type, row) {
                    return `<strong>${data}</strong>`;
                }
            },
            { 
                data: 'username',
                title: 'Username',
                render: function(data) {
                    return `@${data}`;
                }
            },
            { 
                data: 'email',
                title: 'Email',
                render: function(data) {
                    return `<a href="mailto:${data}" class="text-primary">${data}</a>`;
                }
            },
            { 
                data: 'phone',
                title: 'Phone',
                render: function(data) {
                    return `<a href="tel:${data}" class="text-secondary">${data}</a>`;
                }
            },
            { 
                data: 'website',
                title: 'Website',
                render: function(data) {
                    return `<a href="http://${data}" target="_blank" class="text-primary">${data}</a>`;
                }
            },
            { 
                data: 'company.name',
                title: 'Company',
                render: function(data, type, row) {
                    return data || 'N/A';
                }
            },
            {
                data: null,
                title: 'Actions',
                orderable: false,
                width: '200px',
                render: function(data, type, row) {
                    const isFav = isFavorite(row.id);
                    const favClass = isFav ? 'active' : '';
                    const favIcon = isFav ? 'fas fa-star' : 'far fa-star';
                    
                    return `
                        <div class="action-buttons">
                            <button class="action-btn btn-view" onclick="viewUser(${row.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn btn-edit" onclick="editUser(${row.id})" title="Edit User">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn btn-delete" onclick="deleteUser(${row.id})" title="Delete User">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="action-btn btn-favorite ${favClass}" onclick="toggleFavorite(${row.id})" title="Toggle Favorite">
                                <i class="${favIcon}"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        responsive: true,
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        order: [[0, 'asc']],
        language: {
            search: "Search users:",
            lengthMenu: "Show _MENU_ users per page",
            info: "Showing _START_ to _END_ of _TOTAL_ users",
            infoEmpty: "No users found",
            infoFiltered: "(filtered from _MAX_ total users)",
            emptyTable: "No users available",
            zeroRecords: "No matching users found"
        },
        dom: '<"table-controls"<"length-control"l><"search-control"f>>rtip',
        initComplete: function() {
            // Add custom styling to DataTables elements
            $('.dataTables_filter input').attr('placeholder', 'Search users...');
            $('.dataTables_filter input').addClass('form-control');
        }
    });
}

// Get favorite users data
function getFavoriteUsersData() {
    const favoriteIds = getFavoriteUsers();
    return allUsers.filter(user => favoriteIds.includes(user.id));
}

// Toggle favorites view
function toggleFavoritesView() {
    showingFavorites = !showingFavorites;
    
    if (usersTable) {
        usersTable.destroy();
    }
    
    initializeUsersTable();
    updateFavoritesButton();
    
    const message = showingFavorites ? 'Showing favorite users only' : 'Showing all users';
    toastr.info(message, 'View Changed');
}

// Update favorites button text
function updateFavoritesButton() {
    const button = $('#showFavorites');
    const favoriteCount = getFavoriteUsers().length;
    
    if (showingFavorites) {
        button.html('<i class="fas fa-users"></i> Show All Users');
        button.removeClass('btn-secondary').addClass('btn-primary');
    } else {
        button.html(`<i class="fas fa-star"></i> Show Favorites (${favoriteCount})`);
        button.removeClass('btn-primary').addClass('btn-secondary');
    }
}

// View user details
function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        toastr.error('User not found', 'Error');
        return;
    }
    
    currentUser = user;
    populateUserForm(user, true); // true for read-only
    $('#modalTitle').text('User Details');
    $('#saveUser').hide();
    showModal('userModal');
}

// Edit user
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        toastr.error('User not found', 'Error');
        return;
    }
    
    currentUser = user;
    populateUserForm(user, false); // false for editable
    $('#modalTitle').text('Edit User');
    $('#saveUser').show();
    showModal('userModal');
}

// Delete user (simulated)
function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        toastr.error('User not found', 'Error');
        return;
    }
    
    showConfirmation(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
        function() {
            // Simulate deletion (remove from local array)
            allUsers = allUsers.filter(u => u.id !== userId);
            
            // Remove from favorites if exists
            removeFromFavorites(userId);
            
            // Refresh table
            if (usersTable) {
                usersTable.destroy();
            }
            initializeUsersTable();
            updateFavoritesButton();
            
            toastr.success(`User "${user.name}" deleted successfully`, 'Success');
        }
    );
}

// Toggle favorite status
function toggleFavorite(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        toastr.error('User not found', 'Error');
        return;
    }
    
    if (isFavorite(userId)) {
        removeFromFavorites(userId);
    } else {
        addToFavorites(userId);
    }
    
    // Refresh table to update favorite button
    if (usersTable) {
        usersTable.destroy();
    }
    initializeUsersTable();
    updateFavoritesButton();
}

// Populate user form
function populateUserForm(user, readOnly = false) {
    $('#userName').val(user.name).prop('readonly', readOnly);
    $('#userUsername').val(user.username).prop('readonly', readOnly);
    $('#userEmail').val(user.email).prop('readonly', readOnly);
    $('#userPhone').val(user.phone).prop('readonly', readOnly);
    $('#userWebsite').val(user.website).prop('readonly', readOnly);
    $('#userCompany').val(user.company?.name || '').prop('readonly', readOnly);
    $('#userStreet').val(user.address?.street || '').prop('readonly', readOnly);
    $('#userCity').val(user.address?.city || '').prop('readonly', readOnly);
    $('#userZipcode').val(user.address?.zipcode || '').prop('readonly', readOnly);
    
    // Add visual indication for read-only mode
    if (readOnly) {
        $('#userForm input').addClass('readonly');
    } else {
        $('#userForm input').removeClass('readonly');
    }
}

// Save user changes
function saveUserChanges() {
    if (!currentUser) {
        toastr.error('No user selected for editing', 'Error');
        return;
    }
    
    // Validate form
    if (!validateUserForm()) {
        return;
    }
    
    // Get form data
    const formData = {
        name: $('#userName').val().trim(),
        username: $('#userUsername').val().trim(),
        email: $('#userEmail').val().trim(),
        phone: $('#userPhone').val().trim(),
        website: $('#userWebsite').val().trim(),
        company: {
            name: $('#userCompany').val().trim()
        },
        address: {
            street: $('#userStreet').val().trim(),
            city: $('#userCity').val().trim(),
            zipcode: $('#userZipcode').val().trim()
        }
    };
    
    // Update user in local array
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        allUsers[userIndex] = { ...allUsers[userIndex], ...formData };
        
        // Refresh table
        if (usersTable) {
            usersTable.destroy();
        }
        initializeUsersTable();
        
        closeModal($('#userModal'));
        toastr.success('User updated successfully', 'Success');
    } else {
        toastr.error('Failed to update user', 'Error');
    }
}

// Validate user form
function validateUserForm() {
    const name = $('#userName').val().trim();
    const username = $('#userUsername').val().trim();
    const email = $('#userEmail').val().trim();
    
    if (!name) {
        toastr.error('Name is required', 'Validation Error');
        $('#userName').focus();
        return false;
    }
    
    if (!username) {
        toastr.error('Username is required', 'Validation Error');
        $('#userUsername').focus();
        return false;
    }
    
    if (!email) {
        toastr.error('Email is required', 'Validation Error');
        $('#userEmail').focus();
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toastr.error('Please enter a valid email address', 'Validation Error');
        $('#userEmail').focus();
        return false;
    }
    
    return true;
}

// Export users data
function exportUsersData() {
    try {
        const dataToExport = showingFavorites ? getFavoriteUsersData() : allUsers;
        const csvContent = convertUsersToCSV(dataToExport);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `users-${showingFavorites ? 'favorites' : 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        toastr.success('Users data exported successfully', 'Success');
        
    } catch (error) {
        handleError(error, 'Exporting users data');
    }
}

// Convert users data to CSV
function convertUsersToCSV(users) {
    const headers = ['ID', 'Name', 'Username', 'Email', 'Phone', 'Website', 'Company', 'Street', 'City', 'Zipcode', 'Is Favorite'];
    const csvRows = [headers.join(',')];
    
    users.forEach(user => {
        const row = [
            user.id,
            `"${user.name}"`,
            user.username,
            user.email,
            `"${user.phone}"`,
            user.website,
            `"${user.company?.name || ''}"`,
            `"${user.address?.street || ''}"`,
            `"${user.address?.city || ''}"`,
            `"${user.address?.zipcode || ''}"`,
            isFavorite(user.id) ? 'Yes' : 'No'
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Search users (additional to DataTables search)
function searchUsers(query) {
    if (!query.trim()) {
        if (usersTable) {
            usersTable.search('').draw();
        }
        return;
    }
    
    if (usersTable) {
        usersTable.search(query).draw();
    }
}

// Keyboard shortcuts for users page
$(document).on('keydown', function(e) {
    // Only apply shortcuts when on users page
    if (!window.location.pathname.includes('users.html')) return;
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        $('.dataTables_filter input').focus();
    }
    
    // Ctrl/Cmd + N: Add new user (placeholder)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        toastr.info('Add new user functionality would be implemented here', 'Info');
    }
    
    // Ctrl/Cmd + E: Export users
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportUsersData();
    }
});

// Auto-refresh users data every 10 minutes
setInterval(() => {
    if (document.visibilityState === 'visible' && window.location.pathname.includes('users.html')) {
        loadUsers();
    }
}, 10 * 60 * 1000);

