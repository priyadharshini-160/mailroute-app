// MailRoute AI - Public Demo Access
// No passwords or real credentials are collected on the GitHub Pages demo.

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const demoUser = {
            id: 1,
            name: "Demo Logistics Manager",
            email: "demo@mailroute.ai",
            role: "Logistics Manager",
            demo: true
        };

        localStorage.setItem("mailrouteCurrentUser", JSON.stringify(demoUser));

        if (typeof setCurrentUser === "function") {
            setCurrentUser(demoUser);
        }

        window.location.href = "dashboard.html";
    });
});
