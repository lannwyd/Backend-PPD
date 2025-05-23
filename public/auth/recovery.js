document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('recoveryForm');
    const recoveryButton = document.getElementById('recoveryButton');
    const errorMessage = document.getElementById('error_message');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    recoveryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
      

        errorMessage.textContent = '';
        errorMessage.style.color = 'red';

        const email = document.getElementById('email').value.trim();

        if (email === '') {
            errorMessage.textContent = 'Please enter your email';
            return;
        } else if (!emailPattern.test(email)) {
            errorMessage.textContent = 'Please enter a valid email address';
            return;
        }

        try {
            recoveryButton.disabled = true;
            recoveryButton.textContent = 'Sending...';

            const response = await fetch('/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send recovery email');
            }

            errorMessage.style.color = 'green';
            errorMessage.textContent = 'Password reset link sent! Please check your email.';

            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);

        } catch (error) {
            console.error('Recovery error:', error);
            errorMessage.textContent = error.message || 'Failed to send recovery email. Please try again.';
        } finally {
            recoveryButton.disabled = false;
            recoveryButton.textContent = 'Send Recovery Link';
        }
    });
});