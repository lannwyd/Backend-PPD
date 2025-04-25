document.addEventListener('DOMContentLoaded', function() {
    // Get email and role from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const role = urlParams.get('role');

    if (!email || !role) {
        window.location.href = '/register';
        return;
    }

    // Set hidden fields and display email
    document.getElementById('email').value = email;
    document.getElementById('role').value = role;
    document.getElementById('userEmail').textContent = email;

    // Start the resend timer
    startResendTimer();

    // Form submission handler
    document.getElementById('verificationForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get the verify button and disable it during submission
        const verifyBtn = document.getElementById('verifybtn');
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        // Hide any previous error message
        document.getElementById('errorMessage').style.display = 'none';

        const codeInputs = document.querySelectorAll('#codeInputs input');
        const verificationCode = Array.from(codeInputs)
            .map(input => input.value.trim()) // Trim whitespace
            .join('');

        console.log('Submitting verification code:', verificationCode);

        try {
            const response = await fetch('/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    code: verificationCode,
                    role: role
                })
            });

            const data = await response.json();
            console.log('Verification response:', data);

            // After successful verification:
            if (response.ok) {
                const { token } = data;

                // Store token in both cookie and localStorage for redundancy
                document.cookie = `jwt=${token}; path=/; max-age=${60*60*24*7}; Secure; SameSite=Strict`;
                localStorage.setItem('jwt', token);

                // Redirect to dashboard
                window.location.href = '/dashboard';

            }  else {
            const errorMessage = document.getElementById('errorMessage');
            if (data.unverified) {
                errorMessage.textContent = 'Account not verified. Please check your email.';
            } else {
                errorMessage.textContent = data.error || 'Verification failed. Please try again.';
            }
            errorMessage.style.display = 'block';


                // Clear inputs and focus first field
                codeInputs.forEach(input => input.value = '');
                codeInputs[0].focus();
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

// Auto-focus and move between inputs
function moveToNext(input) {
    // Only allow numbers
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length === 1) {
        const next = input.nextElementSibling;
        if (next && next.tagName === 'INPUT') {
            next.focus();
        }
    }
}

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
