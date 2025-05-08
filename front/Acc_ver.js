document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.inputs input');

    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.length === 0) {
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            }
        });
    });
});

function validateInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
}

function startResendTimer() {
    const timerElement = document.getElementById('timer');
    const resendText = document.getElementById('Resend');

    let time = 59; 
    resendText.style.pointerEvents = 'none';
    timerElement.textContent = (time / 100).toFixed(2);

    const interval = setInterval(() => {
        time--;
        if (time < 1) {
            clearInterval(interval);
            timerElement.textContent = "0.00";
            resendText.style.pointerEvents = 'auto';
            return;
        }

       
        timerElement.textContent = (time / 100).toFixed(2);

    }, 1000); 
}
