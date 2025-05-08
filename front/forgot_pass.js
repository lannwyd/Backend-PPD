const password = document.getElementById("password");
const Confirm_Password = document.getElementById("Confirm-Password");
const show_pass = document.getElementById("show_pass");
const show_conf_pass = document.getElementById("show_conf_pass");
const eyeIcon1 = show_pass.querySelector("img");
const eyeIcon2 = show_conf_pass.querySelector("img");
const Reset_pass_btn = document.getElementById("Reset-pass-btn");
const error_message1 = document.getElementById("error_message1");
const error_message2 = document.getElementById("error_message2");

show_pass.onclick = function () {
    if (password.getAttribute("type") === "password") {
        password.setAttribute("type", "text");
        eyeIcon1.setAttribute("src", "..\\Documents\\eye-slash-solid.svg");
    } else {
        password.setAttribute("type", "password");
        eyeIcon1.setAttribute("src", "..\\Documents\\eye-solid.svg");
    }
}
show_conf_pass.onclick = function () {
    if (Confirm_Password.getAttribute("type") === "password") {
        Confirm_Password.setAttribute("type", "text");
        eyeIcon2.setAttribute("src", "..\\Documents\\eye-slash-solid.svg");
    } else {
        Confirm_Password.setAttribute("type", "password");
        eyeIcon2.setAttribute("src", "..\\Documents\\eye-solid.svg");
    }
}

Reset_pass_btn.onclick = function(){
    if(password.value === ""){
        error_message1.textContent = "Please set new password";
        error_message2.textContent = "";
    }else if (password.value.length < 8) {
        error_message1.textContent = "";
        error_message2.textContent = "";
        error_message1.textContent = "Password must be at least 8 characters long";
    }else if(Confirm_Password.value === ""){
        error_message1.textContent = "";
        error_message2.textContent = "";
        error_message2.textContent = "Please set the confirm password";
    }else if(password.value !== Confirm_Password.value){
        error_message1.textContent = "";
        error_message2.textContent = "";
        error_message2.textContent = "Your passwords don’t match. Please double-check."
    }else{
        error_message1.textContent = "";
        error_message2.textContent = "";
        window.location.href = "login.html";
    }
}

