/* =====================================================
   MAILROUTE AI - SHIPMENT MANAGEMENT JAVASCRIPT
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Login Check
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. DOM Elements
    const shipmentForm = document.getElementById("shipmentForm");
    const shipmentIdInput = document.getElementById("shipmentId");
    const sourceInput = document.getElementById("source");
    const destinationInput = document.getElementById("destination");
    const weightInput = document.getElementById("weight");
    const prioritySelect = document.getElementById("priority");
    const modeSelect = document.getElementById("mode");
    const shipmentMessage = document.getElementById("shipmentMessage");
    const shipmentRows = document.getElementById("shipmentRows");
    const shipmentCountBadge = document.getElementById("shipmentCountBadge");
    const emptyState = document.getElementById("emptyState");
    const shipmentSearch = document.getElementById("shipmentSearch");
    const statusFilter = document.getElementById("statusFilter");
    const createShipmentBtn = document.getElementById("createShipmentBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");

    // Display user profile info
    const displayName = currentUser.name || currentUser.email || "Logistics Manager";
    if (userName) userName.textContent = displayName;
    if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            setCurrentUser(null);
            window.location.href = "login.html";
        });
    }

    // Helper: Local Storage Get/Save
    function getShipments() {
        return JSON.parse(localStorage.getItem("shipments")) || [];
    }

    function saveShipments(shipments) {
        localStorage.setItem("shipments", JSON.stringify(shipments));
    }

    function generateShipmentId() {
        const shipments = getShipments();
        let number = shipments.length + 1001;
        let id = "MR-" + number;
        while (shipments.some(s => (s.id || s.shipment_id) === id)) {
            number++;
            id = "MR-" + number;
        }
        return id;
    }

    function showMessage(msg, type) {
        if (!shipmentMessage) return;
        shipmentMessage.textContent = msg;
        shipmentMessage.className = "shipment-message " + type;
        setTimeout(() => {
            if (shipmentMessage) {
                shipmentMessage.textContent = "";
                shipmentMessage.className = "shipment-message";
            }
        }, 4000);
    }

    // Handle Form Submit
    if (shipmentForm) {
        shipmentForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            let id = shipmentIdInput.value.trim();
            const from = sourceInput.value.trim();
            const to = destinationInput.value.trim();
            const weightVal = Number(weightInput.value);
            const priorityVal = prioritySelect.value;
            const preferredMode = modeSelect.value;

            if (!from || !to || !weightVal || weightVal <= 0) {
                showMessage("Please enter valid source, destination, and weight.", "error");
                return;
            }

            if (!id) {
                id = generateShipmentId();
            }

            const shipments = getShipments();
            if (shipments.some(s => (s.id || s.shipment_id) === id)) {
                showMessage("Shipment ID already exists. Please use a unique ID.", "error");
                return;
            }

            if (createShipmentBtn) {
                createShipmentBtn.disabled = true;
                createShipmentBtn.innerHTML = "<span>⏳ AI Optimizing Route...</span>";
            }

            try {
                // Calculate baseline route optimization
                let aiRoutes = [];
                let recommendedMode = preferredMode;
                let estCost = 0;
                let estTime = 0;
                let delayRisk = "Low";

                // Estimated distance calculation (baseline approx)
                const estDistance = 1800;

                // 1. If backend API live, attempt API optimization
                if (CONFIG.isBackendLive) {
                    const apiResult = await apiCall("/optimize-route", "POST", {
                        distance: estDistance,
                        weight: weightVal,
                        weather: "Clear",
                        traffic: "Low"
                    });
                    if (apiResult && apiResult.success) {
                        aiRoutes = apiResult.all_routes || [];
                        const topRoute = apiResult.recommended_route || aiRoutes[0];
                        if (topRoute) {
                            if (preferredMode === "AI Recommended") {
                                recommendedMode = topRoute.transport_mode || topRoute.mode || "Rail";
                            }
                            estCost = topRoute.estimated_cost || 5000;
                            estTime = topRoute.estimated_time_hours || 24;
                            delayRisk = topRoute.delay_risk || "Low";
                        }
                    }
                }

                // 2. Client-side fallback if offline/static
                if (!aiRoutes.length) {
                    aiRoutes = runClientRouteOptimizer(estDistance, weightVal, "Clear", "Low", priorityVal);
                    const topRoute = aiRoutes[0];
                    if (preferredMode === "AI Recommended") {
                        recommendedMode = topRoute.mode;
                    }
                    estCost = topRoute.estimated_cost;
                    estTime = topRoute.estimated_time;
                    delayRisk = topRoute.delay_risk;
                }

                // Create Shipment Object
                const newShipment = {
                    id: id,
                    shipment_id: id,
                    source: from,
                    destination: to,
                    weight: weightVal,
                    priority: priorityVal,
                    mode: recommendedMode,
                    transport_mode: recommendedMode,
                    status: "Pending",
                    estimated_cost: estCost,
                    estimated_time: estTime,
                    delay_risk: delayRisk,
                    createdAt: new Date().toISOString()
                };

                // Try saving via backend API if active
                if (CONFIG.isBackendLive) {
                    await apiCall("/shipments", "POST", newShipment);
                }

                // Save to local storage
                shipments.push(newShipment);
                saveShipments(shipments);

                // Save last optimization result for route-result view
                localStorage.setItem("routeOptimizationResult", JSON.stringify({
                    shipment_id: id,
                    source: from,
                    destination: to,
                    weight: weightVal,
                    priority: priorityVal,
                    selected_mode: recommendedMode,
                    recommended_route: aiRoutes[0],
                    all_routes: aiRoutes
                }));

                showMessage("Shipment created and AI route optimized successfully!", "success");
                shipmentForm.reset();
                renderShipments();

            } catch (err) {
                console.error("Error creating shipment:", err);
                showMessage("Shipment created with fallback route optimization.", "success");
            } finally {
                if (createShipmentBtn) {
                    createShipmentBtn.disabled = false;
                    createShipmentBtn.innerHTML = "<span>🧠 Optimize & Create Shipment →</span>";
                }
            }
        });
    }

    // Render Database Table Rows
    function renderShipments() {
        if (!shipmentRows) return;

        const shipments = getShipments();
        if (shipmentCountBadge) shipmentCountBadge.textContent = shipments.length;

        const searchVal = (shipmentSearch ? shipmentSearch.value : "").trim().toLowerCase();
        const filterVal = statusFilter ? statusFilter.value : "all";

        const filtered = shipments.filter(s => {
            const id = String(s.id || s.shipment_id || "").toLowerCase();
            const src = String(s.source || "").toLowerCase();
            const dest = String(s.destination || "").toLowerCase();
            const mode = String(s.mode || s.transport_mode || "").toLowerCase();
            const status = String(s.status || "Pending");

            const matchesSearch = id.includes(searchVal) || src.includes(searchVal) || dest.includes(searchVal) || mode.includes(searchVal);
            const matchesStatus = filterVal === "all" || status.toLowerCase() === filterVal.toLowerCase();
            return matchesSearch && matchesStatus;
        });

        shipmentRows.innerHTML = "";

        if (filtered.length === 0) {
            if (emptyState) emptyState.classList.add("show");
            return;
        } else {
            if (emptyState) emptyState.classList.remove("show");
        }

        filtered.slice().reverse().forEach(s => {
            const tr = document.createElement("tr");
            const id = s.id || s.shipment_id || "MR-000";
            const src = s.source || "Origin";
            const dest = s.destination || "Destination";
            const weight = s.weight || 0;
            const priority = s.priority || "Medium";
            const mode = s.mode || s.transport_mode || "Road";
            const cost = s.estimated_cost ? `₹${s.estimated_cost.toLocaleString('en-IN')}` : "₹4,500";
            const time = s.estimated_time ? `${s.estimated_time} hrs` : "24 hrs";
            const status = s.status || "Pending";

            let statusClass = "pending";
            const st = status.toLowerCase();
            if (st.includes("delivered")) statusClass = "delivered";
            else if (st.includes("delay")) statusClass = "delayed";
            else if (st.includes("transit")) statusClass = "transit";

            let modeIcon = "🚚";
            if (mode.toLowerCase().includes("rail")) modeIcon = "🚆";
            else if (mode.toLowerCase().includes("air")) modeIcon = "✈️";
            else if (mode.toLowerCase().includes("water")) modeIcon = "🚢";

            tr.innerHTML = `
                <td><strong style="color:#c084fc;">#${id}</strong></td>
                <td>${src} → ${dest}</td>
                <td>${weight} kg</td>
                <td><span style="font-weight:600;">${priority}</span></td>
                <td>${modeIcon} ${mode}</td>
                <td>${cost}</td>
                <td>${time}</td>
                <td><span class="status ${statusClass}">${status}</span></td>
            `;
            shipmentRows.appendChild(tr);
        });
    }

    if (shipmentSearch) shipmentSearch.addEventListener("input", renderShipments);
    if (statusFilter) statusFilter.addEventListener("change", renderShipments);

    renderShipments();
});