/* =====================================================
   MAILROUTE AI - LIVE TRACKING JAVASCRIPT
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // 1. User Authentication Check
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. DOM Elements
    const trackingSearch = document.getElementById("trackingSearch");
    const trackBtn = document.getElementById("trackBtn");
    const trackingContent = document.getElementById("trackingContent");
    const trackingEmpty = document.getElementById("trackingEmpty");
    const trackingShipmentId = document.getElementById("trackingShipmentId");
    const trackingStatus = document.getElementById("trackingStatus");
    const trackingSource = document.getElementById("trackingSource");
    const trackingDestination = document.getElementById("trackingDestination");
    const trackingMode = document.getElementById("trackingMode");
    const progressPercentage = document.getElementById("progressPercentage");
    const progressFill = document.getElementById("progressFill");
    const trackingETA = document.getElementById("trackingETA");
    const trackingCost = document.getElementById("trackingCost");
    const trackingReliability = document.getElementById("trackingReliability");
    const trackingDelayRisk = document.getElementById("trackingDelayRisk");
    const delayTitle = document.getElementById("delayTitle");
    const delayMessage = document.getElementById("delayMessage");
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

    // Track button click & enter key listener
    if (trackBtn) {
        trackBtn.addEventListener("click", function () {
            performTrackingLookup();
        });
    }

    if (trackingSearch) {
        trackingSearch.addEventListener("keyup", function (e) {
            if (e.key === "Enter") performTrackingLookup();
        });
    }

    async function performTrackingLookup() {
        const query = trackingSearch ? trackingSearch.value.trim().toLowerCase() : "";
        let shipments = JSON.parse(localStorage.getItem("shipments")) || [];

        // Check backend API if reachable
        if (CONFIG.isBackendLive && query) {
            const apiRes = await apiCall(`/shipments/${query}`, "GET");
            if (apiRes && apiRes.success && apiRes.shipment) {
                renderTrackingView(apiRes.shipment);
                return;
            }
        }

        let target = null;
        if (query) {
            target = shipments.find(s => 
                String(s.id || s.shipment_id || "").toLowerCase() === query ||
                String(s.source || "").toLowerCase().includes(query) ||
                String(s.destination || "").toLowerCase().includes(query)
            );
        } else if (shipments.length > 0) {
            target = shipments[shipments.length - 1]; // Latest shipment default
        }

        if (target) {
            renderTrackingView(target);
        } else {
            showEmptyView();
        }
    }

    function renderTrackingView(shipment) {
        if (trackingEmpty) trackingEmpty.style.display = "none";
        if (trackingContent) trackingContent.style.display = "block";

        const id = shipment.id || shipment.shipment_id || "MR-1024";
        const src = shipment.source || "Coimbatore";
        const dest = shipment.destination || "Delhi";
        const mode = shipment.mode || shipment.transport_mode || "Road";
        const status = shipment.status || "In Transit";
        const cost = shipment.estimated_cost || shipment.cost || 4800;
        const time = shipment.estimated_time || shipment.deliveryTime || 24;
        const delay = shipment.delay_risk || shipment.delayRisk || "Low";

        if (trackingShipmentId) trackingShipmentId.textContent = `#${id}`;
        if (trackingSource) trackingSource.textContent = src;
        if (trackingDestination) trackingDestination.textContent = dest;
        if (trackingMode) trackingMode.textContent = `${getModeIcon(mode)} ${mode}`;
        if (trackingETA) trackingETA.textContent = `${time} hrs`;
        if (trackingCost) trackingCost.textContent = `₹${cost.toLocaleString('en-IN')}`;
        if (trackingReliability) trackingReliability.textContent = `94%`;
        if (trackingDelayRisk) trackingDelayRisk.textContent = delay;

        // Calculate progress percentage based on status
        let pct = 65;
        let stClass = "transit";
        const st = status.toLowerCase();
        if (st.includes("delivered")) { pct = 100; stClass = "delivered"; }
        else if (st.includes("delay")) { pct = 45; stClass = "delayed"; }
        else if (st.includes("pending")) { pct = 15; stClass = "pending"; }

        if (trackingStatus) {
            trackingStatus.textContent = status;
            trackingStatus.className = `status-badge ${stClass}`;
        }
        if (progressPercentage) progressPercentage.textContent = `${pct}%`;
        if (progressFill) progressFill.style.width = `${pct}%`;

        // Update delay risk notification box
        if (delay.toLowerCase() === "high") {
            if (delayTitle) delayTitle.textContent = "High Delay Risk Alert";
            if (delayMessage) delayMessage.textContent = "AI engine detected potential weather/traffic congestion along this transit corridor. Rerouting options available.";
        } else {
            if (delayTitle) delayTitle.textContent = "Route operating normally";
            if (delayMessage) delayMessage.textContent = "No significant delay risk detected. Transit schedule is proceeding on time.";
        }
    }

    function showEmptyView() {
        if (trackingContent) trackingContent.style.display = "none";
        if (trackingEmpty) trackingEmpty.style.display = "block";
    }

    function getModeIcon(mode) {
        const m = String(mode).toLowerCase();
        if (m.includes("rail")) return "🚆";
        if (m.includes("air")) return "✈️";
        if (m.includes("water")) return "🚢";
        return "🚚";
    }

    // Auto-load initial tracking info
    performTrackingLookup();
});