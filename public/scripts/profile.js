document.addEventListener('DOMContentLoaded', async function() {
    await loadUserProfile();

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

        document.getElementById('firstName').value = user.first_name || '';
        document.getElementById('lastName').value = user.last_name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';

        const profilePic = document.getElementById('profilePic');
        const profileInitials = document.getElementById('profileInitials');

        if (user.profile_picture) {
            profilePic.textContent = '';
            profilePic.style.backgroundImage = `url(${user.profile_picture})`;
            profilePic.style.backgroundSize = 'cover';
            profilePic.style.backgroundPosition = 'center';
        } else {
            const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
            profilePic.textContent = initials;
            profilePic.style.backgroundImage = '';
        }

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
            const userId = window.userId;

            const response = await fetch(`/api/users/${userId}`, {
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

            window.originalData = {
                ...window.originalData,
                first_name: updatedData.data.first_name,
                last_name: updatedData.data.last_name,
                phone: updatedData.data.phone
            };

            document.getElementById('profileName').textContent =
                `${updatedData.data.first_name} ${updatedData.data.last_name}`;
            const initials = `${updatedData.data.first_name.charAt(0)}${updatedData.data.last_name.charAt(0)}`.toUpperCase();
            document.getElementById('profilePic').textContent = initials;
            document.getElementById('profileInitials').textContent = initials;
        } catch (error) {
            console.error('Update error:', error);
            alert(error.message || 'Failed to update profile');

            document.getElementById('firstName').value = window.originalData.first_name;
            document.getElementById('lastName').value = window.originalData.last_name;
            document.getElementById('phone').value = window.originalData.phone;
        } finally {
            saveText.classList.remove('hidden');
            saveSpinner.classList.add('hidden');
            saveBtn.disabled = false;
        }
    });

    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('firstName').value = window.originalData.first_name;
        document.getElementById('lastName').value = window.originalData.last_name;
        document.getElementById('phone').value = window.originalData.phone;
    });

    document.getElementById('changePasswordBtn').addEventListener('click', function () {
        const section = document.getElementById('changePasswordSection');
        section.classList.toggle('hidden');
    });

    document.getElementById('submitPasswordChange').addEventListener('click', async function () {
        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const message = document.getElementById('passwordChangeMessage');

        message.textContent = '';

        if (!currentPassword || !newPassword) {
            message.textContent = 'Both fields are required.';
            return;
        }

        if (newPassword.length < 8) {
            message.textContent = 'Password must be at least 8 characters.';
            return;
        }

        try {
            const response = await fetch('/auth/update-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update password');

            message.style.color = 'green';
            message.textContent = 'Password updated successfully!';
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
        } catch (error) {
            message.style.color = 'red';
            message.textContent = error.message;
        }
    });


    document.getElementById('editPicBtn').addEventListener('click', function() {
        document.getElementById('profilePicInput').click();
    });

    document.getElementById('profilePicInput').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPEG, PNG)');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const profilePic = document.getElementById('profilePic');
            profilePic.textContent = '';
            profilePic.style.backgroundImage = `url(${event.target.result})`;
            profilePic.style.backgroundSize = 'cover';
            profilePic.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);

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

            const profilePic = document.getElementById('profilePic');
            profilePic.style.backgroundImage = '';
            profilePic.textContent = document.getElementById('profileInitials').textContent;
        }
    });

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