document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetForm');
    const resetButton = document.getElementById('Reset-pass-btn');
    const errorMessage1 = document.getElementById('error_message1');
    const errorMessage2 = document.getElementById('error_message2');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('Confirm-Password');
    const showPass = document.getElementById('show_pass');
    const showConfPass = document.getElementById('show_conf_pass');

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const togglePasswordVisibility = (input, eyeIcon) => {
        if (input.getAttribute('type') === 'password') {
            input.setAttribute('type', 'text');
            eyeIcon.setAttribute('src', './Documents/eye-solid.svg');
        } else {
            input.setAttribute('type', 'password');
            eyeIcon.setAttribute('src', './Documents/eye-slash-solid.svg');
        }
    };

    showPass.onclick = () => togglePasswordVisibility(passwordInput, showPass.querySelector('img'));
    showConfPass.onclick = () => togglePasswordVisibility(confirmPasswordInput, showConfPass.querySelector('img'));

    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        errorMessage1.textContent = '';
        errorMessage2.textContent = '';

        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!password || !confirmPassword) {
            errorMessage1.textContent = 'Please enter a new password';
            return;
        }

        if (password.length < 8) {
            errorMessage1.textContent = 'Password must be at least 8 characters long';
            return;
        }

        if (password !== confirmPassword) {
            errorMessage2.textContent = 'Passwords do not match';
            return;
        }

        try {
            resetButton.disabled = true;
            resetButton.textContent = 'Resetting...';

            const response = await fetch('/auth/reset-password/' + token, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed');
            }

            errorMessage1.style.color = 'green';
            errorMessage1.textContent = 'Password reset successfully! Redirecting to login...';

            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);

        } catch (error) {
            console.error('Reset error:', error);
            errorMessage1.textContent = error.message || 'Password reset failed. Please try again.';
        } finally {
            resetButton.disabled = false;
            resetButton.textContent = 'Reset password';
        }
    });
});
