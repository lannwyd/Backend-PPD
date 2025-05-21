const Session_Name = document.getElementById("Session_Name");
const Description = document.getElementById("Description");
const Session_ID = document.getElementById("Session_ID");
const create_session_btn = document.getElementById("create_session_btn");
const Join_session_btn = document.getElementById("Join_session_btn");
const SessionName_error_message = document.getElementById("SessionName_error_message");
const Description_error_message = document.getElementById("Description_error_message");
const SessionID_error_message = document.getElementById("SessionID_error_message");
const profileLink = document.getElementById("profileLink");
const logoutLink = document.getElementById("logoutLink");
const profileInitials = document.getElementById("profileInitials");
const welcomeMessage = document.getElementById("welcom_back");

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    setupEventListeners();
});

async function loadUserProfile() {
    try {
        const response = await fetch('/auth/profile', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const { data } = await response.json();
        const user = data.user;
        const role = data.role;

        // Update welcome message
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${user.first_name}!`;
        }

        // Update profile initials
        if (profileInitials) {
            const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
            profileInitials.textContent = initials;
        }

        // Store user role in localStorage
        localStorage.setItem('userRole', role);
    } catch (error) {
        console.error('Profile load error:', error);
        window.location.href = '/login';
    }
}

function setupEventListeners() {
    // Create session button
    if (create_session_btn) {
        create_session_btn.onclick = function() {
            if (Session_Name.value === "") {
                SessionName_error_message.textContent = "Session name is required";
            } else {
                SessionName_error_message.textContent = "";
            }

            if (Description.value === "") {
                Description_error_message.textContent = "Description is required";
            } else {
                Description_error_message.textContent = "";
                if (Session_Name.value !== "") {
                    window.location.href = "../TP/TP_2.html";
                }
            }
        };
    }

    // Join session button
    if (Join_session_btn) {
        Join_session_btn.onclick = function() {
            let sessionID = Session_ID.value.trim();
            if (Session_ID.value === "") {
                SessionID_error_message.textContent = "Session ID is required";
            } else {
                SessionID_error_message.textContent = "";
                window.location.href =sessionID;
            }
        };
    }

    // Profile link
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToProfile();
        });
    }

    // Logout link
    // Logout link
    if (logoutLink) {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();

            try {
                const response = await fetch('/auth/logout', {
                    method: 'POST',
                    credentials: 'include'  // Important for cookies
                });

                if (response.ok) {
                    // Clear client-side storage if needed
                    localStorage.removeItem('userRole');

                    // Redirect to login page
                    window.location.href = '/login';
                } else {
                    throw new Error('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to logout. Please try again.');
            }
        });
    }

    // Sidebar toggle
    const sid_icon = document.getElementById("sid_icon");
    const Aside = document.getElementById("Aside");
    const Main = document.getElementById("Main");
    let isSidebarVisible = true;

    if (sid_icon && Aside && Main) {
        sid_icon.onclick = function() {
            if (isSidebarVisible) {
                Aside.style.width = "0";
                Aside.style.padding = "0";
                Aside.style.overflow = "hidden";
                Main.style.marginLeft = "-323px";
            } else {
                Aside.style.width = "323px";
                Aside.style.padding = "0 10%";
                Aside.style.overflow = "visible";
                Main.style.marginLeft = "0px";
            }
            isSidebarVisible = !isSidebarVisible;
        };
    }

    // Style results
    const results = document.querySelectorAll('[id^="res"]');
    results.forEach(res => {
        if (res.textContent.trim() === 'Failed') {
            res.style.backgroundColor = '#FEE2E2';
            res.style.color = '#991B1B';
            res.style.borderRadius = '4px';
            res.style.width = '79px';
            res.style.height = '20px';
        } else if (res.textContent.trim() === 'Successful') {
            res.style.backgroundColor = '#D1FAE5';
            res.style.color = '#065F46';
            res.style.borderRadius = '4px';
        }
    });
}

function navigateToProfile() {
    const userRole = localStorage.getItem('userRole') || 'student';
    window.location.href = '/profile';
}