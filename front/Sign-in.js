const email = document.getElementById("email");
const password = document.getElementById("password");
const show_pass = document.getElementById("show_pass");
const eyeIcon1 = show_pass.querySelector("img");
const Sign_In = document.getElementById("Sign_In");
const error_message1 = document.getElementById("error_message1");
const error_message2 = document.getElementById("error_message2");


show_pass.onclick = function () {
    if (password.getAttribute("type") === "password") {
        password.setAttribute("type", "text");
        eyeIcon1.setAttribute("src", "..\\Documents\\eye-solid.svg");
    } else {
        password.setAttribute("type", "password");
        eyeIcon1.setAttribute("src", "..\\Documents\\eye-slash-solid.svg");
    }
}

Sign_In.onclick = function(){
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value === "") {
        error_message1.textContent = "Please enter your email";
    } else if (!emailPattern.test(email.value)) {
        error_message1.textContent = "Please enter a valid email address";
    } else {
        error_message1.textContent = "";
    }

    if(password.value === ""){
        error_message2.textContent = "Please Enter your password";
    }else if (password.value.length < 8) {
        error_message2.textContent = "Password must be at least 8 characters long";
    }else{
        error_message2.textContent = "";
        if (emailPattern.test(email.value)) {
            if (document.getElementById("agree").checked) {
                localStorage.setItem("email", email.value);
                localStorage.setItem("password", password.value);
            } else {
                localStorage.removeItem("email");
                localStorage.removeItem("password");
            }
            window.location.href = "..\\farouk-code\\main.html";
        }
    }
}
window.onload = function () {
    if (localStorage.getItem("email")) {
        email.value = localStorage.getItem("email");
        password.value = localStorage.getItem("password");
        document.getElementById("agree").checked = true;
    }
};

