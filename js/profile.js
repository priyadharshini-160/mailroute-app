/* =====================================================
   MAILROUTE AI - PROFILE SETTINGS JAVASCRIPT
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const bigAvatar = document.getElementById("bigAvatar");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editPhone = document.getElementById("editPhone");
    const editOrg = document.getElementById("editOrg");
    const profileForm = document.getElementById("profileForm");
    const profileMessage = document.getElementById("profileMessage");
    const logoutBtn = document.getElementById("logoutBtn");

    const displayName = currentUser.name || currentUser.email || "Logistics Manager";
    const initial = displayName.charAt(0).toUpperCase();

    if (userName) userName.textContent = displayName;
    if (userAvatar) userAvatar.textContent = initial;
    if (bigAvatar) bigAvatar.textContent = initial;
    if (profileName) profileName.textContent = displayName;
    if (profileEmail) profileEmail.textContent = currentUser.email || "";

    if (editName) editName.value = currentUser.name || "";
    if (editEmail) editEmail.value = currentUser.email || "";
    if (editPhone) editPhone.value = currentUser.phone || "";
    if (editOrg) editOrg.value = currentUser.organization || "";

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            setCurrentUser(null);
            window.location.href = "login.html";
        });
    }

    if (profileForm) {
        profileForm.addEventListener("submit", function (e) {
            e.preventDefault();

            currentUser.name = editName.value.trim();
            currentUser.phone = editPhone.value.trim();
            currentUser.organization = editOrg.value.trim();

            setCurrentUser(currentUser);

            if (profileMessage) {
                profileMessage.textContent = "Profile updated successfully!";
                profileMessage.style.color = "#4ade80";
                setTimeout(() => { profileMessage.textContent = ""; }, 3000);
            }
        });
    }
});