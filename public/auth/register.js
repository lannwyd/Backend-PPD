// In register.js and other frontend files
const API_BASE = 'http://localhost:5000'; // Your backend URL
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

    // Registration handler
    document.getElementById('cre_acc').addEventListener('click', async function(e) {
        e.preventDefault();

        const userData = {
            first_name: document.getElementById('First_Name').value.trim(),
            last_name: document.getElementById('last_name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            role: document.getElementById('Role').value
        };

        // Clear previous errors
        document.querySelectorAll('.error_message').forEach(el => el.textContent = '');

        // Validation
        let isValid = true;
        if (!userData.first_name) {
            document.getElementById('Firstname_error_message').textContent = 'First name is required';
            isValid = false;
        }
        if (!userData.last_name) {
            document.getElementById('Lastname_error_message').textContent = 'Last name is required';
            isValid = false;
        }
        if (!userData.email) {
            document.getElementById('email_error_message').textContent = 'Email is required';
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(userData.email)) {
            document.getElementById('email_error_message').textContent = 'Invalid email format';
            isValid = false;
        }
        if (!userData.password) {
            document.getElementById('error_message1').textContent = 'Password is required';
            isValid = false;
        } else if (userData.password.length < 8) {
            document.getElementById('error_message1').textContent = 'Password must be at least 8 characters';
            isValid = false;
        }
        if (userData.password !== document.getElementById('Confirm-Password').value) {
            document.getElementById('error_message2').textContent = 'Passwords do not match';
            isValid = false;
        }
        if (!document.getElementById('agree').checked) {
            document.getElementById('not_checked').textContent = 'You must agree to the terms';
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Redirect to verification page
            window.location.href = `/Account-verification.html?email=${encodeURIComponent(userData.email)}&role=${userData.role}`;
        } catch (error) {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        }
    });
});