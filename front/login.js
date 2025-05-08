const First_Name = document.getElementById("First_Name");
const last_name = document.getElementById("last_name");
const email = document.getElementById("email");
const email_error_message = document.getElementById("email_error_message");
const password = document.getElementById("password");
const Confirm_Password = document.getElementById("Confirm-Password");
const show_pass = document.getElementById("show_pass");
const show_conf_pass = document.getElementById("show_conf_pass");
const eyeIcon1 = show_pass.querySelector("img");
const eyeIcon2 = show_conf_pass.querySelector("img");
const cre_acc = document.getElementById("cre_acc");
const error_message1 = document.getElementById("error_message1");
const error_message2 = document.getElementById("error_message2");
const not_checked = document.getElementById("not_checked");
const Firstname_error_message = document.getElementById("Firstname_error_message");
const Lastname_error_message = document.getElementById("Lastname_error_message");

show_pass.onclick = function () {
    
    if (password.getAttribute("type") === "password") {
        password.setAttribute("type", "text");
        eyeIcon1.setAttribute("src", "..\\Documents\\eye-solid.svg");
    } else {
        password.setAttribute("type", "password");
        eyeIcon1.setAttribute("src", "..\\Documents\\eye-slash-solid.svg");
    }
}
show_conf_pass.onclick = function () {
    if (Confirm_Password.getAttribute("type") === "password") {
        Confirm_Password.setAttribute("type", "text");
        eyeIcon2.setAttribute("src", "..\\Documents\\eye-solid.svg");
    } else {
        Confirm_Password.setAttribute("type", "password");
        eyeIcon2.setAttribute("src", "..\\Documents\\eye-slash-solid.svg");
    }
}

cre_acc.onclick = function () {
    if (First_Name.value === "") {
        Firstname_error_message.textContent = "Please enter your first name";
    }else{
        Firstname_error_message.textContent = "";
    }

    if (last_name.value === "") {
        Lastname_error_message.textContent = "Please enter your last name";
    }else{
        Lastname_error_message.textContent = "";
    }

    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value === "") {
        email_error_message.textContent = "Please enter your email";
    } else if (!emailPattern.test(email.value)) {
        email_error_message.textContent = "Please enter a valid email address";
    } else {
        email_error_message.textContent = "";
    }

    
    if (!document.getElementById("agree").checked) {
        not_checked.textContent = "Please check the box to agree to the Terms and Privacy Policy";
    }else{
        not_checked.textContent = "";
    }
    if (password.value === "") {
        error_message1.textContent = "Please set new password";
        error_message2.textContent = "";
    } else if (password.value.length < 8) {
        error_message1.textContent = "";
        error_message2.textContent = "";
        error_message1.textContent = "Password must be at least 8 characters long";
    } else if (Confirm_Password.value === "") {
        error_message1.textContent = "";
        error_message2.textContent = "";
        error_message2.textContent = "Please set the confirm password";
    } else if (password.value !== Confirm_Password.value) {
        error_message1.textContent = "";
        error_message2.textContent = "";
        error_message2.textContent = "Your passwords don’t match. Please double-check."
    } else {
        error_message1.textContent = "";
        error_message2.textContent = "";

        if (emailPattern.test(email.value) && First_Name.value != "" && last_name.value != "" && document.getElementById("agree").checked) {
                window.location.href = "Account-verification.html";
        }
    }
}

