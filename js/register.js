// MailRoute AI - Public Demo Profile
// Only basic demo profile information is stored locally. No passwords are stored.

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) return;

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";

        if (!name) {
            alert("Please enter your name.");
            return;
        }

        if (!email || !email.includes("@")) {
            alert("Please enter a valid email address.");
            return;
        }

        const demoUser = {
            id: Date.now(),
            name: name,
            email: email,
            role: "Logistics Manager",
            createdAt: new Date().toISOString(),
            demo: true
        };

        localStorage.setItem("mailrouteCurrentUser", JSON.stringify(demoUser));

        if (typeof setCurrentUser === "function") {
            setCurrentUser(demoUser);
        }

        window.location.href = "dashboard.html";
    });
});
