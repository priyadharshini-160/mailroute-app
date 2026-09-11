/* =====================================================
   MAILROUTE AI - DASHBOARD JAVASCRIPT
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // 1. User Authentication Check
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. DOM Elements
    const userName = document.getElementById("userName");
    const welcomeName = document.getElementById("welcomeName");
    const userAvatar = document.getElementById("userAvatar");
    const logoutBtn = document.getElementById("logoutBtn");
    const totalShipmentsEl = document.getElementById("totalShipments");
    const activeShipmentsEl = document.getElementById("activeShipments");
    const deliveredShipmentsEl = document.getElementById("deliveredShipments");
    const delayedShipmentsEl = document.getElementById("delayedShipments");
    const recentShipmentsTable = document.getElementById("recentShipmentsTable");

    // 3. Populate User Data
    const displayName = currentUser.name || currentUser.email || "Logistics Manager";
    if (userName) userName.textContent = displayName;
    if (welcomeName) welcomeName.textContent = displayName.split(" ")[0];
    if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

    // 4. Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            setCurrentUser(null);
            window.location.href = "login.html";
        });
    }

    // 5. Fetch & Render Shipments Data
    async function loadDashboardData() {
        let shipments = [];

        // Fetch from API if backend is live
        if (CONFIG.isBackendLive) {
            const apiResult = await apiCall("/shipments", "GET");
            if (apiResult && apiResult.success && Array.isArray(apiResult.shipments)) {
                shipments = apiResult.shipments;
            }
        }

        // Fallback to LocalStorage if empty or static
        if (!shipments.length) {
            shipments = JSON.parse(localStorage.getItem("shipments")) || [];
        }

        // Default initial demo shipments if no data exists yet
        if (!shipments.length) {
            shipments = [
                { id: "MR-1024", source: "Coimbatore", destination: "Delhi", mode: "Rail", status: "Delivered" },
                { id: "MR-1025", source: "Chennai", destination: "Mumbai", mode: "Road", status: "In Transit" },
                { id: "MR-1026", source: "Bengaluru", destination: "Kolkata", mode: "Air", status: "Delayed" }
            ];
            localStorage.setItem("shipments", JSON.stringify(shipments));
        }

        // Calculate Stats
        let active = 0, delivered = 0, delayed = 0;
        shipments.forEach(s => {
            const st = String(s.status || "").toLowerCase();
            if (st.includes("delivered")) delivered++;
            else if (st.includes("delay")) delayed++;
            else active++;
        });

        if (totalShipmentsEl) totalShipmentsEl.textContent = shipments.length;
        if (activeShipmentsEl) activeShipmentsEl.textContent = active;
        if (deliveredShipmentsEl) deliveredShipmentsEl.textContent = delivered;
        if (delayedShipmentsEl) delayedShipmentsEl.textContent = delayed;

        // Render Recent Shipments Table
        renderRecentShipments(shipments);
    }

    function renderRecentShipments(shipments) {
        if (!recentShipmentsTable) return;

        const recent = shipments.slice(-4).reverse();
        
        let html = `
            <div class="table-header">
                <span>Shipment ID</span>
                <span>Route</span>
                <span>Mode</span>
                <span>Status</span>
            </div>
        `;

        recent.forEach(s => {
            const id = s.id || s.shipment_id || "MR-000";
            const src = s.source || s.from || "Origin";
            const dest = s.destination || s.to || "Destination";
            const mode = s.mode || s.transport_mode || "Road";
            const status = s.status || "Pending";

            let statusClass = "transit";
            const st = status.toLowerCase();
            if (st.includes("delivered")) statusClass = "delivered";
            else if (st.includes("delay")) statusClass = "delayed";
            else if (st.includes("pending")) statusClass = "pending";

            let modeIcon = "🚚";
            if (mode.toLowerCase().includes("rail")) modeIcon = "🚆";
            else if (mode.toLowerCase().includes("air")) modeIcon = "✈️";
            else if (mode.toLowerCase().includes("water")) modeIcon = "🚢";

            html += `
                <div class="shipment-row">
                    <span class="shipment-id">#${id}</span>
                    <span>${src} → ${dest}</span>
                    <span>${modeIcon} ${mode}</span>
                    <span class="status ${statusClass}">${status}</span>
                </div>
            `;
        });

        recentShipmentsTable.innerHTML = html;
    }

    loadDashboardData();
});