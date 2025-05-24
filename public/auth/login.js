document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signInButton = document.getElementById('Sign_In');
    const errorMessage1 = document.getElementById('error_message1');
    const errorMessage2 = document.getElementById('error_message2');
    const errorMessage3 = document.getElementById('error_message3');
    const passwordInput = document.getElementById('password');
    const showPass = document.getElementById('show_pass');
    const eyeIcon = showPass.querySelector('img');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Toggle password visibility
    showPass.onclick = function() {
        if (passwordInput.getAttribute('type') === 'password') {
            passwordInput.setAttribute('type', 'text');
            eyeIcon.setAttribute('src', './Documents/eye-solid.svg');
        } else {
            passwordInput.setAttribute('type', 'password');
            eyeIcon.setAttribute('src', './Documents/eye-slash-solid.svg');
        }
    };

    // Remember me functionality
    window.onload = function() {
        if (localStorage.getItem('email')) {
            document.getElementById('email').value = localStorage.getItem('email');
            document.getElementById('password').value = localStorage.getItem('password');
            document.getElementById('agree').checked = true;
        }
    };

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Reset error messages
        errorMessage1.textContent = '';
        errorMessage2.textContent = '';
        errorMessage3.textContent = '';

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const role = document.getElementById('role') ? document.getElementById('role').value : null;

        // Validate email
        if (email === '') {
            errorMessage1.textContent = 'Please enter your email';
            return;
        } else if (!emailPattern.test(email)) {
            errorMessage1.textContent = 'Please enter a valid email address';
            return;
        }

        if (password === '') {
            errorMessage2.textContent = 'Please enter your password';
            return;
        } else if (password.length < 8) {
            errorMessage2.textContent = 'Password must be at least 8 characters long';
            return;
        }

        if (role === null || role === '') {
            errorMessage3.textContent = 'Please select your role';
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
                    email: email,
                    password: password,
                    role: role
                }),
                credentials: 'include'
            });

            const data = await response.json();
          

            if (!response.ok) {
                if (data.unverified) {
                 
                    localStorage.setItem('pendingRole', role);
                    window.location.href = `/Account-verification.html?email=${encodeURIComponent(email)}&role=${role}`;
                    return;
                }
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
          
            localStorage.setItem('userRole', data.data.role);

            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login error:', error);
            errorMessage1.textContent = error.message || 'Login failed. Please try again.';
        } finally {
            signInButton.disabled = false;
            signInButton.textContent = 'Sign In';
        }
    });
});