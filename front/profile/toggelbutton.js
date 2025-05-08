



document.getElementById("toggleButton").addEventListener("click", function () {
    let button = this;
    let circle = document.getElementById("toggleCircle");

    if (button.classList.contains("bg-[#374151]")) {
        button.classList.remove("bg-[#374151]");
        button.classList.add("bg-[#9FEF00]");
        circle.classList.add("translate-x-6");
    } else {
        button.classList.remove("bg-[#9FEF00]");
        button.classList.add("bg-[#374151]");
        circle.classList.remove("translate-x-6");
    }
});
