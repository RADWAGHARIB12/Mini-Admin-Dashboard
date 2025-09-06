// Posts management JavaScript
let allPosts = [];
let allUsers = [];
let filteredPosts = [];
let currentPost = null;
let searchTimeout;

$(document).ready(function() {
    // Initialize posts page
    initializePostsPage();
});

// Initialize posts page
function initializePostsPage() {
    // Load posts and users data
    loadPostsData();
    
    // Setup event listeners
    setupPostsEvents();
}

// Setup posts page event listeners
function setupPostsEvents() {
    // Search functionality
    $('#searchPosts').on('input', debounce(handleSearch, 300));
    
    // Add new post button
    $('#addPost').on('click', showAddPostModal);
    
    // Refresh posts button
    $('#refreshPosts').on('click', function() {
        loadPostsData();
        toastr.info('Posts data refreshed', 'Info');
    });
    
    // Modal events
    $('#closePostModal').on('click', function() {
        closeModal($('#postModal'));
    });
    
    $('#savePost').on('click', savePost);
    
    // Comments modal events
    $('#closeCommentsModal').on('click', function() {
        closeModal($('#commentsModal'));
    });
    
    // Form submission
    $('#postForm').on('submit', function(e) {
        e.preventDefault();
        savePost();
    });
}

// Load posts and users data
async function loadPostsData() {
    try {
        showLoader();
        
        // Fetch posts and users concurrently
        const [postsResult, usersResult] = await Promise.all([
            fetchPosts(),
            fetchUsers()
        ]);
        
        if (!postsResult.success || !usersResult.success) {
            throw new Error('Failed to fetch data');
        }
        
        allPosts = postsResult.data;
        allUsers = usersResult.data;
        
        // Merge with local posts
        const localPosts = getLocalPosts();
        allPosts = [...localPosts, ...allPosts];
        
        // Initialize filtered posts
        filteredPosts = [...allPosts];
        
        // Populate user dropdown
        populateUserDropdown();
        
        // Display posts
        displayPosts();
        
    } catch (error) {
        handleError(error, 'Loading posts data');
    } finally {
        hideLoader();
    }
}

// Populate user dropdown for post creation
function populateUserDropdown() {
    const userSelect = $('#postUserId');
    userSelect.empty().append('<option value="">Select User</option>');
    
    allUsers.forEach(user => {
        userSelect.append(`<option value="${user.id}">${user.name} (@${user.username})</option>`);
    });
}

// Handle search functionality
function handleSearch() {
    const query = $('#searchPosts').val().toLowerCase().trim();
    
    if (!query) {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.body.toLowerCase().includes(query) ||
            getUserName(post.userId).toLowerCase().includes(query)
        );
    }
    
    displayPosts();
}

// Display posts in grid
function displayPosts() {
    const postsGrid = $('#postsGrid');
    const noResults = $('#noResults');
    
    if (filteredPosts.length === 0) {
        postsGrid.hide();
        noResults.show();
        return;
    }
    
    noResults.hide();
    postsGrid.show().empty();
    
    filteredPosts.forEach((post, index) => {
        const postCard = createPostCard(post, index);
        postsGrid.append(postCard);
    });
    
    // Animate post cards
    animatePostCards();
}

// Create post card HTML
function createPostCard(post, index) {
    const userName = getUserName(post.userId);
    const isLocal = post.isLocal || false;
    const createdDate = post.createdAt ? formatDate(post.createdAt) : 'Unknown date';
    
    return `
        <div class="post-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                ${isLocal ? '<span class="badge badge-local">Local</span>' : ''}
            </div>
            <div class="post-meta">
                <i class="fas fa-user"></i> ${userName} • 
                <i class="fas fa-calendar"></i> ${createdDate}
                ${isLocal ? ' • <i class="fas fa-home"></i> Local Post' : ''}
            </div>
            <div class="post-body">${truncateText(post.body, 150)}</div>
            <div class="post-actions">
                <div class="post-actions-left">
                    <span class="comments-count" onclick="viewComments(${post.id})">
                        <i class="fas fa-comments"></i>
                        <span id="comments-${post.id}">-</span> comments
                    </span>
                </div>
                <div class="post-actions-right">
                    <button class="action-btn btn-view" onclick="viewPost(${post.id})" title="View Post">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="editPost(${post.id})" title="Edit Post">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deletePost(${post.id})" title="Delete Post">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get user name by ID
function getUserName(userId) {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
}

// Animate post cards
function animatePostCards() {
    $('.post-card').each(function(index) {
        const card = $(this);
        setTimeout(() => {
            card.addClass('animate__fadeInUp');
        }, index * 100);
    });
    
    // Load comments count for each post
    loadCommentsCount();
}

// Load comments count for posts
async function loadCommentsCount() {
    try {
        const commentsResult = await fetchComments();
        if (commentsResult.success) {
            const comments = commentsResult.data;
            
            // Count comments per post
            const commentCounts = {};
            comments.forEach(comment => {
                commentCounts[comment.postId] = (commentCounts[comment.postId] || 0) + 1;
            });
            
            // Update comment counts in UI
            filteredPosts.forEach(post => {
                const count = commentCounts[post.id] || 0;
                $(`#comments-${post.id}`).text(count);
            });
        }
    } catch (error) {
        console.error('Failed to load comments count:', error);
    }
}

// Show add post modal
function showAddPostModal() {
    currentPost = null;
    $('#postModalTitle').text('Add New Post');
    $('#postForm')[0].reset();
    $('#savePost').text('Create Post');
    showModal('postModal');
}

// View post details
function viewPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
        toastr.error('Post not found', 'Error');
        return;
    }
    
    currentPost = post;
    populatePostForm(post, true); // true for read-only
    $('#postModalTitle').text('Post Details');
    $('#savePost').hide();
    showModal('postModal');
}

// Edit post
function editPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
        toastr.error('Post not found', 'Error');
        return;
    }
    
    currentPost = post;
    populatePostForm(post, false); // false for editable
    $('#postModalTitle').text('Edit Post');
    $('#savePost').text('Update Post').show();
    showModal('postModal');
}

// Delete post
function deletePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
        toastr.error('Post not found', 'Error');
        return;
    }
    
    showConfirmation(
        `Are you sure you want to delete the post "${truncateText(post.title, 50)}"?`,
        function() {
            if (post.isLocal) {
                // Delete local post
                deleteLocalPost(postId);
                allPosts = allPosts.filter(p => p.id !== postId);
            } else {
                // Simulate API deletion (remove from local array)
                allPosts = allPosts.filter(p => p.id !== postId);
            }
            
            // Update filtered posts
            filteredPosts = filteredPosts.filter(p => p.id !== postId);
            
            // Refresh display
            displayPosts();
            
            toastr.success('Post deleted successfully', 'Success');
        }
    );
}

// Populate post form
function populatePostForm(post, readOnly = false) {
    $('#postTitle').val(post.title).prop('readonly', readOnly);
    $('#postBody').val(post.body).prop('readonly', readOnly);
    $('#postUserId').val(post.userId).prop('disabled', readOnly);
    
    // Add visual indication for read-only mode
    if (readOnly) {
        $('#postForm input, #postForm textarea, #postForm select').addClass('readonly');
    } else {
        $('#postForm input, #postForm textarea, #postForm select').removeClass('readonly');
    }
}

// Save post (create or update)
function savePost() {
    // Validate form
    if (!validatePostForm()) {
        return;
    }
    
    const formData = {
        title: $('#postTitle').val().trim(),
        body: $('#postBody').val().trim(),
        userId: parseInt($('#postUserId').val())
    };
    
    if (currentPost) {
        // Update existing post
        updateExistingPost(currentPost.id, formData);
    } else {
        // Create new post
        createNewPost(formData);
    }
}

// Create new post
function createNewPost(postData) {
    try {
        const newPost = addLocalPost(postData);
        allPosts.unshift(newPost);
        
        // Update filtered posts if it matches current search
        const searchQuery = $('#searchPosts').val().toLowerCase().trim();
        if (!searchQuery || 
            newPost.title.toLowerCase().includes(searchQuery) ||
            newPost.body.toLowerCase().includes(searchQuery) ||
            getUserName(newPost.userId).toLowerCase().includes(searchQuery)) {
            filteredPosts.unshift(newPost);
        }
        
        // Refresh display
        displayPosts();
        
        closeModal($('#postModal'));
        toastr.success('Post created successfully', 'Success');
        
    } catch (error) {
        handleError(error, 'Creating post');
    }
}

// Update existing post
function updateExistingPost(postId, postData) {
    try {
        const postIndex = allPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            throw new Error('Post not found');
        }
        
        const post = allPosts[postIndex];
        
        if (post.isLocal) {
            // Update local post
            const updatedPost = updateLocalPost(postId, postData);
            if (updatedPost) {
                allPosts[postIndex] = updatedPost;
            }
        } else {
            // Update in local array (simulated API update)
            allPosts[postIndex] = { ...post, ...postData };
        }
        
        // Update filtered posts
        const filteredIndex = filteredPosts.findIndex(p => p.id === postId);
        if (filteredIndex > -1) {
            filteredPosts[filteredIndex] = allPosts[postIndex];
        }
        
        // Refresh display
        displayPosts();
        
        closeModal($('#postModal'));
        toastr.success('Post updated successfully', 'Success');
        
    } catch (error) {
        handleError(error, 'Updating post');
    }
}

// Validate post form
function validatePostForm() {
    const title = $('#postTitle').val().trim();
    const body = $('#postBody').val().trim();
    const userId = $('#postUserId').val();
    
    if (!title) {
        toastr.error('Title is required', 'Validation Error');
        $('#postTitle').focus();
        return false;
    }
    
    if (!body) {
        toastr.error('Content is required', 'Validation Error');
        $('#postBody').focus();
        return false;
    }
    
    if (!userId) {
        toastr.error('Please select a user', 'Validation Error');
        $('#postUserId').focus();
        return false;
    }
    
    return true;
}

// View comments for a post
async function viewComments(postId) {
    try {
        showLoader();
        
        const result = await fetchComments(postId);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        const comments = result.data;
        displayComments(comments, postId);
        
    } catch (error) {
        handleError(error, 'Loading comments');
    } finally {
        hideLoader();
    }
}

// Display comments in modal
function displayComments(comments, postId) {
    const post = allPosts.find(p => p.id === postId);
    const postTitle = post ? post.title : 'Unknown Post';
    
    $('#commentsModalTitle').text(`Comments for: ${truncateText(postTitle, 50)}`);
    
    const commentsList = $('#commentsList');
    commentsList.empty();
    
    if (comments.length === 0) {
        commentsList.html(`
            <div class="no-comments">
                <i class="fas fa-comments"></i>
                <h3>No comments yet</h3>
                <p>Be the first to comment on this post!</p>
            </div>
        `);
    } else {
        comments.forEach(comment => {
            const commentHtml = `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-name">${comment.name}</span>
                        <span class="comment-email">${comment.email}</span>
                    </div>
                    <div class="comment-body">${comment.body}</div>
                </div>
            `;
            commentsList.append(commentHtml);
        });
    }
    
    showModal('commentsModal');
}

// Export posts data
function exportPostsData() {
    try {
        const csvContent = convertPostsToCSV(filteredPosts);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `posts-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        toastr.success('Posts data exported successfully', 'Success');
        
    } catch (error) {
        handleError(error, 'Exporting posts data');
    }
}

// Convert posts data to CSV
function convertPostsToCSV(posts) {
    const headers = ['ID', 'Title', 'Content', 'User', 'Type', 'Created Date'];
    const csvRows = [headers.join(',')];
    
    posts.forEach(post => {
        const row = [
            post.id,
            `"${post.title.replace(/"/g, '""')}"`,
            `"${post.body.replace(/"/g, '""')}"`,
            `"${getUserName(post.userId)}"`,
            post.isLocal ? 'Local' : 'API',
            post.createdAt ? formatDate(post.createdAt) : 'Unknown'
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Keyboard shortcuts for posts page
$(document).on('keydown', function(e) {
    // Only apply shortcuts when on posts page
    if (!window.location.pathname.includes('posts.html')) return;
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        $('#searchPosts').focus();
    }
    
    // Ctrl/Cmd + N: Add new post
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showAddPostModal();
    }
    
    // Ctrl/Cmd + E: Export posts
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportPostsData();
    }
    
    // ESC: Clear search
    if (e.key === 'Escape') {
        $('#searchPosts').val('');
        handleSearch();
    }
});

// Auto-refresh posts data every 15 minutes
setInterval(() => {
    if (document.visibilityState === 'visible' && window.location.pathname.includes('posts.html')) {
        loadPostsData();
    }
}, 15 * 60 * 1000);

