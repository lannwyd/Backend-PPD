
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    const signInButton = document.getElementById('Sign_In');
    const errorMessage1 = document.getElementById('error_message1');
    const errorMessage2 = document.getElementById('error_message2');
    const showPass = document.getElementById('show_pass');
    const passwordField = document.getElementById('password');
    const roleSelect = document.getElementById('role');

    // Toggle password visibility
    showPass.addEventListener('click', function () {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            showPass.innerHTML = '<img src="../Documents/eye-solid.svg" alt="eye" width="18">';
        } else {
            passwordField.type = 'password';
            showPass.innerHTML = '<img src="../Documents/eye-slash-solid.svg" alt="eye" width="18">';
        }
    });

    // Form submit handler
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log("Form submitted");

        // Reset error messages
        errorMessage1.textContent = '';
        errorMessage2.textContent = '';

        // Validate inputs
        if (!emailInput.value.trim()) {
            errorMessage1.textContent = 'Email is required';
            return;
        }

        if (!passwordInput.value.trim()) {
            errorMessage2.textContent = 'Password is required';
            return;
        }

        if (!roleSelect.value) {
            errorMessage1.textContent = 'Please select your role';
            return;
        }

        try {
            signInButton.disabled = true;
            signInButton.textContent = 'Signing in...';

            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                    role: roleSelect.value
                }),
                credentials: 'include' // This is crucial for cookies
            });



            const data = await response.json();
            console.log("Response data:", data);

            // In login.js
            if (!response.ok) {
                if (data.unverified) {
                    localStorage.setItem('pendingEmail', emailInput.value.trim());
                    localStorage.setItem('pendingRole', roleSelect.value);
                    window.location.href = `/Account-verification.html`;
                    return;
                }
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', emailInput.value.trim());
            localStorage.setItem('userRole', data.data.role); // Use the role from response

            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            signInButton.disabled = false;
            signInButton.textContent = 'Sign In';
        }
    });
});
