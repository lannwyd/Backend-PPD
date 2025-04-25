
    async function loadStudentProfile() {
    try {
    const response = await fetch("http://localhost:3000/students/1"); // Replace '1' with the actual student ID
    const student = await response.json();

    // Update the profile fields
    document.querySelector(".font-weight-bold").textContent = `${student.FirstName} ${student.LastName}`;
    document.querySelector(".text-black-50").textContent = student.Email;
    document.querySelector("input[placeholder='first name']").value = student.FirstName;
    document.querySelector("input[placeholder='surname']").value = student.LastName;
    document.querySelector("input[placeholder='enter email id']").value = student.Email;
    // Add more fields as needed
} catch (error) {
    console.error("Error loading student profile:", error);
}
}

    loadStudentProfile();

