document.addEventListener('DOMContentLoaded', async function() {
    // Load user profile
    await loadUserProfile();

    // Setup event listeners
    setupEventListeners();
});

async function loadUserProfile() {
    try {
        const response = await fetch('/auth/profile', { credentials: 'include' });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error response:', errorData);
            throw new Error(errorData.error || 'Failed to fetch profile');
        }

        const data = await response.json();
        console.log("Profile data received:", data);

        if (!data || !data.data || !data.data.user) {
            throw new Error("Invalid profile data structure");
        }

        const { user } = data.data;

        // Update the DOM elements
        document.getElementById('firstName').value = user.first_name || '';
        document.getElementById('lastName').value = user.last_name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';

        // Update profile picture or initials
        const profilePic = document.getElementById('profilePic');
        const profileInitials = document.getElementById('profileInitials');

        if (user.profile_picture) {
            // If profile picture exists, show it
            profilePic.textContent = '';
            profilePic.style.backgroundImage = `url(${user.profile_picture})`;
            profilePic.style.backgroundSize = 'cover';
            profilePic.style.backgroundPosition = 'center';
        } else {
            // Otherwise show initials
            const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
            profilePic.textContent = initials;
            profilePic.style.backgroundImage = '';
        }

        // Always update initials (for the dropdown)
        const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
        profileInitials.textContent = initials;
        document.getElementById('profileName').textContent = `${user.first_name} ${user.last_name}`;

    } catch (error) {
        console.error('Profile load error:', error);
        alert('Failed to load profile. Redirecting to login...');
        window.location.href = '/login';
    }
}
function setupEventListeners() {
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const saveBtn = document.getElementById('saveBtn');
        const saveText = document.getElementById('saveText');
        const saveSpinner = document.getElementById('saveSpinner');

        saveText.classList.add('hidden');
        saveSpinner.classList.remove('hidden');
        saveBtn.disabled = true;

        try {
            const formData = {
                first_name: document.getElementById('firstName').value,
                last_name: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value || null
            };



            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            if (formData.phone && !phoneRegex.test(formData.phone)) {
                alert('Please enter a valid phone number (e.g., +1234567890)');
                return;
            }
            const userId = window.userId; // Should match req.user.user_id

            const response = await fetch(`/api/users/${userId}`, {  // Add this line at top of file
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const updatedData = await response.json();
            alert('Profile updated successfully!');

            // Update original data
            window.originalData = {
                ...window.originalData,
                first_name: updatedData.data.first_name,
                last_name: updatedData.data.last_name,
                phone: updatedData.data.phone
            };

            // Update profile display
            document.getElementById('profileName').textContent =
                `${updatedData.data.first_name} ${updatedData.data.last_name}`;
            const initials = `${updatedData.data.first_name.charAt(0)}${updatedData.data.last_name.charAt(0)}`.toUpperCase();
            document.getElementById('profilePic').textContent = initials;
            document.getElementById('profileInitials').textContent = initials;
        } catch (error) {
            console.error('Update error:', error);
            alert(error.message || 'Failed to update profile');

            // Reset form to original values
            document.getElementById('firstName').value = window.originalData.first_name;
            document.getElementById('lastName').value = window.originalData.last_name;
            document.getElementById('phone').value = window.originalData.phone;
        } finally {
            saveText.classList.remove('hidden');
            saveSpinner.classList.add('hidden');
            saveBtn.disabled = false;
        }
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('firstName').value = window.originalData.first_name;
        document.getElementById('lastName').value = window.originalData.last_name;
        document.getElementById('phone').value = window.originalData.phone;
    });

    // Change password button
    document.getElementById('changePasswordBtn').addEventListener('click', async function() {
        const newPassword = prompt("Enter your new password:");
        if (!newPassword) return;

        const currentPassword = prompt("Enter your current password:");
        if (!currentPassword) return;

        try {
            const response = await fetch('/auth/update-password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to change password');
            }

            alert('Password changed successfully!');
        } catch (error) {
            console.error('Password change error:', error);
            alert(error.message || 'Failed to change password');
        }
    });

    // Profile picture upload
    document.getElementById('editPicBtn').addEventListener('click', function() {
        document.getElementById('profilePicInput').click();
    });

    document.getElementById('profilePicInput').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPEG, PNG)');
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = function(event) {
            const profilePic = document.getElementById('profilePic');
            profilePic.textContent = '';
            profilePic.style.backgroundImage = `url(${event.target.result})`;
            profilePic.style.backgroundSize = 'cover';
            profilePic.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);

        // Upload to server
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await fetch('/api/users/upload-profile-picture', {
                method: 'PATCH',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload profile picture');
            }

            alert('Profile picture updated successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.message || 'Failed to upload profile picture');

            // Reset to initials if upload fails
            const profilePic = document.getElementById('profilePic');
            profilePic.style.backgroundImage = '';
            profilePic.textContent = document.getElementById('profileInitials').textContent;
        }
    });

    // Toggle buttons
    document.getElementById('emailToggle').addEventListener('click', function() {
        const circle = document.getElementById('emailToggleCircle');
        if (circle.classList.contains('translate-x-6')) {
            circle.classList.remove('translate-x-6');
            circle.classList.add('translate-x-1');
            this.classList.remove('bg-[#9FEF00]');
            this.classList.add('bg-[#374151]');
        } else {
            circle.classList.remove('translate-x-1');
            circle.classList.add('translate-x-6');
            this.classList.remove('bg-[#374151]');
            this.classList.add('bg-[#9FEF00]');
        }
    });

    document.getElementById('darkModeToggle').addEventListener('click', function() {
        const circle = document.getElementById('darkModeToggleCircle');
        if (circle.classList.contains('translate-x-6')) {
            circle.classList.remove('translate-x-6');
            circle.classList.add('translate-x-1');
            this.classList.remove('bg-[#9FEF00]');
            this.classList.add('bg-[#374151]');
        } else {
            circle.classList.remove('translate-x-1');
            circle.classList.add('translate-x-6');
            this.classList.remove('bg-[#374151]');
            this.classList.add('bg-[#9FEF00]');
        }
    });

    // Logout
    document.getElementById('logoutLink').addEventListener('click', async function(e) {
        e.preventDefault();

        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
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