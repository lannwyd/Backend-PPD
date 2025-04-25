// register.js
const API_BASE = 'http://localhost:5000/auth';

document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle (keep existing code)
    document.querySelectorAll('.show').forEach(showBtn => {
        showBtn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('img');

            if (input.type === 'password') {
                input.type = 'text';
                icon.src = './Documents/eye-solid.svg';
            } else {
                input.type = 'password';
                icon.src = './Documents/eye-slash-solid.svg';
            }
        });
    });

    // Registration handler - updated to remove role conversion
    document.getElementById('cre_acc').addEventListener('click', async function(e) {
        e.preventDefault();

        // Get form values
        const userData = {
            FirstName: document.getElementById('First_Name').value.trim(),
            LastName: document.getElementById('last_name').value.trim(),
            Email: document.getElementById('email').value.trim(),
            Password: document.getElementById('password').value,
            role: document.getElementById('Role').value,
            GradeID: 2
        };

        // Clear previous error messages
        document.querySelectorAll('.error_message').forEach(el => el.textContent = '');

        // Client-side validation
        let isValid = true;

        if (!userData.FirstName) {
            document.getElementById('Firstname_error_message').textContent = 'First name is required';
            isValid = false;
        }

        if (!userData.LastName) {
            document.getElementById('Lastname_error_message').textContent = 'Last name is required';
            isValid = false;
        }

        if (!userData.Email) {
            document.getElementById('email_error_message').textContent = 'Email is required';
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(userData.Email)) {
            document.getElementById('email_error_message').textContent = 'Invalid email format';
            isValid = false;
        }

        if (!userData.Password) {
            document.getElementById('error_message1').textContent = 'Password is required';
            isValid = false;
        } else if (userData.Password.length < 8) {
            document.getElementById('error_message1').textContent = 'Password must be at least 8 characters';
            isValid = false;
        }

        const confirmPassword = document.getElementById('Confirm-Password').value;
        if (userData.Password !== confirmPassword) {
            document.getElementById('error_message2').textContent = 'Passwords do not match';
            isValid = false;
        }

        if (!document.getElementById('agree').checked) {
            document.getElementById('not_checked').textContent = 'You must agree to the terms and conditions';
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle server-side validation errors
                if (data.messages) {
                    // Display all validation messages
                    data.messages.forEach(msg => {
                        alert(msg); // Or display in specific error fields
                    });
                } else {
                    throw new Error(data.message || data.error || 'Registration failed');
                }
                return;
            }

            // On success
            localStorage.setItem('pendingEmail', userData.Email);
            localStorage.setItem('pendingRole', userData.role);
            window.location.href = `/Account-verification.html?email=${encodeURIComponent(userData.Email)}&role=${userData.role}`;
        } catch (error) {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        }
    });
});