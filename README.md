Mini Admin Dashboard: My Freelance Project Showcase 🚀


What I've Built & Why It Matters ✨

This dashboard is a comprehensive tool for managing users and posts, complete with real-time statistics and a smooth user experience. Here’s a breakdown of what you'll find:

•Dashboard Overview: A quick glance at key metrics like total users, posts, and comments. It's designed to give you immediate insights.

•User Management (with DataTables): This is where the magic happens for user data. I've integrated DataTables to provide robust features like sorting, searching, and pagination. You can view, edit, and (simulated) delete users. Plus, there's a cool favorites feature that persists in your browser's LocalStorage – perfect for keeping track of important users!

•Post Management: A dynamic section for handling posts. I've implemented live search, so you can find content instantly. You can also add new posts, edit existing ones, and (simulated) delete them. Each post card also shows a comment count, and you can dive in to view all comments for any post.

•Notifications (Toastr): I believe good user feedback is crucial. That's why I've integrated Toastr to provide clear, non-intrusive notifications for every action you take.

•Loader & Responsiveness: You'll notice a smooth loader to enhance the user experience during data fetching. And yes, it's fully responsive – looks great on any device!

•Light/Dark Mode: Because who doesn't love a good dark mode? I've added a toggle to switch between light and dark themes, and it even remembers your preference.

The Tech Stack I Used 🛠️

I choose these technologies to build a robust and efficient frontend application:

•HTML5 & CSS3: The foundation! I focused on semantic HTML and modern CSS practices, including custom properties for easy theming and Flexbox/Grid for layout.

•JavaScript (Vanilla ES6+): All the dynamic functionality is powered by clean, modern JavaScript.

•jQuery 3.7.1: Used for DOM manipulation and simplifying AJAX requests.

•DataTables 1.13.6: An absolute lifesaver for creating powerful, interactive tables for user management.

•Animate.css 4.1.1: For those subtle, professional animations that make the UI feel alive.

•Toastr: My go-to for elegant, user-friendly notifications.

•Font Awesome 6.4.0: For all the crisp icons you see throughout the dashboard.

APIs Powering the Data 🔗

For data, I've leveraged the fantastic JSONPlaceholder API. It's a great mock API that allowed me to focus on the frontend logic without needing a backend:

•Users: https://jsonplaceholder.typicode.com/users

•Posts: https://jsonplaceholder.typicode.com/posts

•Comments: https://jsonplaceholder.typicode.com/comments?postId={id}

(Note: Since JSONPlaceholder is read-only, I've implemented local storage for any create, update, or delete operations to give you a full CRUD experience!)

Project Structure 📁

I've kept the project structure clean and modular for easy navigation and future scalability:

Plain Text


mini-admin-dashboard/
├── index.html              # The main dashboard page
├── users.html              # Dedicated page for user management
├── posts.html              # Dedicated page for post management
├── css/
│   └── style.css           # All the styling, including light/dark mode variables
├── js/
│   ├── main.js             # Core utilities and global functions
│   ├── dashboard.js        # Logic specific to the dashboard page
│   ├── users.js            # Logic for user management
│   └── posts.js            # Logic for post management
├── assets/
│   └── images/             # Placeholder for any image assets
└── README.md               # You're reading it! Project documentation


Getting Started: How to Run This Project on Your Machine 🚀

Ready to see it in action? Here's how you can get this dashboard up and running on your Windows machine. It's super straightforward!


1.Download the Project:

•If you're viewing this on GitHub, click the green "Code" button and choose "Download ZIP".

•Alternatively, if you have Git installed, you can clone the repository:




2.Start a Local Web Server :


Taking a Tour: How to Use the Dashboard 📖

I've tried to make the dashboard intuitive, but here are some pointers:

•Dashboard Page: This is your landing spot. See the summary statistics, and use the quick action cards to jump to Users or Posts.

•User Management: Head over to the "Users" tab. You'll see a sortable, searchable table. Click the eye icon to view details, the pencil to edit, and the trash can to (simulated) delete. The star icon lets you add/remove users from your favorites, and you can toggle to see only your favorites!

•Post Management: On the "Posts" tab, you'll find posts displayed as cards. Use the search bar for live filtering. You can add new posts, edit existing ones, and delete them. Click on the comments count to see what people are saying!

•Theme Toggle: Look for the moon/sun icon in the top right. Click it to switch between light and dark modes.

•Keyboard Shortcuts: I've added a few handy shortcuts for quicker navigation and actions (e.g., Ctrl+E to export data on relevant pages).


