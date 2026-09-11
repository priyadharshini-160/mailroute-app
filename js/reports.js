/* =====================================================
   MAILROUTE AI - ANALYTICS & REPORTS JAVASCRIPT
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Login Check
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. DOM Elements
    const totalShipmentsEl = document.getElementById("totalShipments");
    const deliveredShipmentsEl = document.getElementById("deliveredShipments");
    const transitShipmentsEl = document.getElementById("transitShipments");
    const totalCostEl = document.getElementById("totalCost");
    const averageCostEl = document.getElementById("averageCost");
    const averageReliabilityEl = document.getElementById("averageReliability");
    const averageDeliveryTimeEl = document.getElementById("averageDeliveryTime");
    const exportBtn = document.getElementById("exportBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");

    // Profile info
    const displayName = currentUser.name || currentUser.email || "Logistics Manager";
    if (userName) userName.textContent = displayName;
    if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            setCurrentUser(null);
            window.location.href = "login.html";
        });
    }

    // Calculate analytics metrics
    function loadAnalytics() {
        const shipments = JSON.parse(localStorage.getItem("shipments")) || [];

        let total = shipments.length;
        let delivered = 0;
        let transit = 0;
        let totalCost = 0;
        let totalTime = 0;

        shipments.forEach(s => {
            const st = String(s.status || "").toLowerCase();
            if (st.includes("delivered")) delivered++;
            else transit++;

            totalCost += (s.estimated_cost || s.cost || 4500);
            totalTime += (s.estimated_time || s.deliveryTime || 24);
        });

        if (totalShipmentsEl) totalShipmentsEl.textContent = total;
        if (deliveredShipmentsEl) deliveredShipmentsEl.textContent = delivered;
        if (transitShipmentsEl) transitShipmentsEl.textContent = transit;
        if (totalCostEl) totalCostEl.textContent = `₹${totalCost.toLocaleString('en-IN')}`;

        const avgCost = total > 0 ? Math.round(totalCost / total) : 4850;
        const avgTime = total > 0 ? Math.round(totalTime / total) : 26;

        if (averageCostEl) averageCostEl.textContent = `₹${avgCost.toLocaleString('en-IN')}`;
        if (averageReliabilityEl) averageReliabilityEl.textContent = `93.5%`;
        if (averageDeliveryTimeEl) averageDeliveryTimeEl.textContent = `${avgTime} hrs`;
    }

    // Export Analytics Report to CSV
    if (exportBtn) {
        exportBtn.addEventListener("click", function () {
            const shipments = JSON.parse(localStorage.getItem("shipments")) || [];
            
            let csv = "Shipment ID,Source,Destination,Weight (kg),Priority,Mode,Cost (INR),Est Time (hrs),Status\n";
            shipments.forEach(s => {
                const id = s.id || s.shipment_id || "N/A";
                const src = s.source || "";
                const dest = s.destination || "";
                const weight = s.weight || 0;
                const priority = s.priority || "Medium";
                const mode = s.mode || s.transport_mode || "Road";
                const cost = s.estimated_cost || s.cost || 0;
                const time = s.estimated_time || s.deliveryTime || 0;
                const status = s.status || "Pending";

                csv += `"${id}","${src}","${dest}",${weight},"${priority}","${mode}",${cost},${time},"${status}"\n`;
            });

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `MailRoute_AI_Analytics_Report_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    loadAnalytics();
});