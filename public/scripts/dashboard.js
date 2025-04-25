const Session_Name = document.getElementById("Session_Name");
const Description = document.getElementById("Description");
const Session_ID = document.getElementById("Session_ID");
const create_session_btn = document.getElementById("create_session_btn");
const Join_session_btn = document.getElementById("Join_session_btn");
const SessionName_error_message = document.getElementById("SessionName_error_message");
const Description_error_message = document.getElementById("Description_error_message");
const SessionID_error_message = document.getElementById("SessionID_error_message");
const profileLink = document.getElementById("profileLink");

create_session_btn.onclick = function () {
    if (Session_Name.value === "") {
        SessionName_error_message.textContent = "Session name is required";
    } else {
        SessionName_error_message.textContent = "";
    }

    if (Description.value === "") {
        Description_error_message.textContent = "Description is required";
    } else {
        Description_error_message.textContent = "";
        if(Session_Name.value !== ""){
            window.location.href = "../TP/TP_2.html";
        }
    }
}

Join_session_btn.onclick = function () {
    if (Session_ID.value === "") {
        SessionID_error_message.textContent = "Session ID is required";
    } else {
        SessionID_error_message.textContent = "";
        window.location.href = "../TP/TP_2.html";
    }
}

const sid_icon = document.getElementById("sid_icon");
const Aside = document.getElementById("Aside");
const Main = document.getElementById("Main");
let isSidebarVisible = true;

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

const results = document.querySelectorAll('[id^="res"]');
results.forEach(res => {
    if(res.textContent.trim() === 'Failed') {
        res.style.backgroundColor = '#FEE2E2';
        res.style.color = '#991B1B';
        res.style.borderRadius = '4px';
        res.style.width = '79px';
        res.style.height = '20px';
    } else if(res.textContent.trim() === 'Successful') {
        res.style.backgroundColor = '#D1FAE5';
        res.style.color = '#065F46';
        res.style.borderRadius = '4px';
    }
});

function navigateToProfile() {
    let userRole = localStorage.getItem('userRole');

    if (!userRole) {
        fetch('/auth/profile', {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                return response.json();
            })
            .then(data => {
                if (data.data?.role) {
                    userRole = data.data.role;
                    localStorage.setItem('userRole', userRole);
                    redirectToProfile(userRole);
                } else {
                    window.location.href = '/login';
                }
            })
            .catch(error => {
                console.error('Profile fetch error:', error);
                window.location.href = '/login';
            });
    } else {
        redirectToProfile(userRole);
    }
}

function redirectToProfile(role) {
    if (role === 'teacher') {
        window.location.href = '/profile2_teacher.html';
    } else {
        window.location.href = '/profile2.html';
    }
}



document.addEventListener('DOMContentLoaded', function() {
    async function loadUserProfile() {
        try {
            const response = await fetch('/auth/profile', {
                credentials: 'include'
            });

            if (response.ok) {
                const { data } = await response.json();

                const profileName = document.querySelector('#profile_name p');
                if (profileName && data.user) {
                    profileName.textContent = `${data.user.FirstName} ${data.user.LastName}`;
                }

                const welcomeMessage = document.querySelector('#welcom_back h1');
                if (welcomeMessage && data.user) {
                    welcomeMessage.textContent = `Welcome back, ${data.user.FirstName}!`;
                }

                if (data.role) {
                    localStorage.setItem('userRole', data.role);
                }
            } else {
                const errorData = await response.json();
                console.error('Profile fetch error:', errorData);

                if (response.status === 401) {
                    if (errorData.expired) {
                        alert('Your session has expired. Please log in again.');
                    } else if (errorData.invalid) {
                        alert('Invalid session. Please log in again.');
                    }
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        }
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();

            try {
                const response = await fetch('/auth/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    window.location.href = '/login';
                } else {
                    console.error('Logout failed');
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred during logout.');
            }
        });
    }

    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToProfile();
        });
    }

    const profileDropdown = document.querySelector('.profile-dropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownContent = this.querySelector('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
            }
        });
    }

    document.addEventListener('click', function(e) {
        const dropdownContent = document.querySelector('.dropdown-content');
        if (dropdownContent && !e.target.closest('.profile-dropdown')) {
            dropdownContent.style.display = 'none';
        }
    });

    loadUserProfile();
});