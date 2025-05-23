document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const role = urlParams.get('role');

    if (!email || !role) {
        window.location.href = '/register';
        return;
    }

    document.getElementById('email').value = email;
    document.getElementById('role').value = role;
    document.getElementById('userEmail').textContent = email;

    // Initialize input handling
    const inputs = document.querySelectorAll('#codeInputs input');
    
    inputs.forEach((input, index) => {
        // Handle numeric input and auto-focus
        input.addEventListener('input', (e) => {
            // Only allow numbers
            input.value = input.value.replace(/[^0-9]/g, '');
            
            if (input.value.length === 1) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });

        // Handle backspace to move to previous field
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0) {
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            }
        });

        // Handle paste event for automatic code distribution
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');
            
            if (pasteData.length === inputs.length) {
                // Distribute each character to corresponding input
                pasteData.split('').forEach((char, charIndex) => {
                    if (inputs[charIndex]) {
                        inputs[charIndex].value = char;
                    }
                });
                // Focus the last input
                inputs[inputs.length - 1].focus();
            }
        });
    });

    startResendTimer();

    document.getElementById('verificationForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const verifyBtn = document.getElementById('verifybtn');
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        const verificationCode = Array.from(inputs)
            .map(input => input.value.trim())
            .join('');

        // Validate all fields are filled
        if (verificationCode.length !== inputs.length) {
            document.getElementById('errorMessage').textContent = 'Please fill in all verification code fields';
            document.getElementById('errorMessage').style.display = 'block';
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify Email';
            return;
        }

        try {
            const response = await fetch('/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    code: verificationCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and redirect
                localStorage.setItem('jwt', data.token);
                document.cookie = `jwt=${data.token}; path=/; max-age=${60*60*24*7}; Secure; SameSite=Strict`;
                window.location.href = '/dashboard';
            } else {
                document.getElementById('errorMessage').textContent = data.error || 'Verification failed';
                document.getElementById('errorMessage').style.display = 'block';
                inputs.forEach(input => input.value = '');
                inputs[0].focus();
            }
        } catch (error) {
            console.error('Verification error:', error);
            document.getElementById('errorMessage').textContent = 'Network error. Please try again.';
            document.getElementById('errorMessage').style.display = 'block';
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify Email';
        }
    });
});

// Resend timer functionality
function startResendTimer() {
    const resendElement = document.getElementById('Resend');
    const timerElement = document.getElementById('timer');
    let timeLeft = 59;

    // Disable resend during countdown
    resendElement.classList.add('disabled');
    resendElement.onclick = null;

    const timer = setInterval(() => {
        timerElement.textContent = `0:${timeLeft.toString().padStart(2, '0')}`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            timerElement.textContent = '';
            resendElement.innerHTML = 'Didn\'t receive the code? <sup style="color: #9FEF00;">Resend</sup>';
            resendElement.classList.remove('disabled');
            resendElement.onclick = resendVerificationCode;
        }
    }, 1000);
}

// Resend verification code
async function resendVerificationCode() {
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('/auth/resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, role })
        });

        if (response.ok) {
            startResendTimer();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to resend verification code');
        }
    } catch (error) {
        console.error('Resend error:', error);
        alert('Network error. Please try again.');
    }
}