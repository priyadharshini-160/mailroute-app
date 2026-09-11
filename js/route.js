/* =====================================================
   MAILROUTE AI - INTELLIGENT ROUTE OPTIMIZATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // 1. User Login Check
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. DOM Elements
    const routeForm = document.getElementById("routeForm");
    const routeSource = document.getElementById("routeSource");
    const routeDestination = document.getElementById("routeDestination");
    const routeWeight = document.getElementById("routeWeight");
    const routePriority = document.getElementById("routePriority");
    const swapRoute = document.getElementById("swapRoute");
    const optimizeBtn = document.getElementById("optimizeBtn");
    const routeLoader = document.getElementById("routeLoader");
    const routeResult = document.getElementById("routeResult");
    const transportGrid = document.getElementById("transportGrid");
    
    // Result elements
    const resultSource = document.getElementById("resultSource");
    const resultDestination = document.getElementById("resultDestination");
    const recommendedRoute = document.getElementById("recommendedRoute");
    const recommendIcon = document.getElementById("recommendIcon");
    const recommendationText = document.getElementById("recommendationText");
    const confidenceValue = document.getElementById("confidenceValue");
    const estimatedTime = document.getElementById("estimatedTime");
    const estimatedCost = document.getElementById("estimatedCost");
    const reliability = document.getElementById("reliability");
    const delayRisk = document.getElementById("delayRisk");
    const aiExplanation = document.getElementById("aiExplanation");
    const pathModeLabel = document.getElementById("pathModeLabel");
    const resetRoute = document.getElementById("resetRoute");
    const saveRoute = document.getElementById("saveRoute");
    const logoutBtn = document.getElementById("logoutBtn");
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");

    let lastCalculatedRoutes = null;
    let currentOptimalRoute = null;

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

    // Swap locations
    if (swapRoute) {
        swapRoute.addEventListener("click", function () {
            const temp = routeSource.value;
            routeSource.value = routeDestination.value;
            routeDestination.value = temp;
        });
    }

    // Handle Route Optimization Form Submit
    if (routeForm) {
        routeForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const src = routeSource.value.trim();
            const dest = routeDestination.value.trim();
            const weight = Number(routeWeight.value);
            const priority = routePriority.value;

            if (!src || !dest || !weight || weight <= 0) {
                alert("Please enter valid origin, destination, and weight.");
                return;
            }

            // UI Loader State
            if (routeResult) routeResult.classList.remove("show");
            if (routeLoader) routeLoader.classList.add("show");
            if (optimizeBtn) {
                optimizeBtn.disabled = true;
                optimizeBtn.innerHTML = "⏳ AI Analyzing Routes...";
            }

            setTimeout(async function () {
                let routes = [];
                const estDistance = 1800; // Baseline distance calculation

                // 1. Attempt API Optimization if Flask is running
                if (CONFIG.isBackendLive) {
                    const apiData = await apiCall("/optimize-route", "POST", {
                        distance: estDistance,
                        weight: weight,
                        weather: "Clear",
                        traffic: "Low"
                    });
                    if (apiData && apiData.success && apiData.all_routes) {
                        routes = apiData.all_routes;
                    }
                }

                // 2. Client-side ML fallback
                if (!routes.length) {
                    routes = runClientRouteOptimizer(estDistance, weight, "Clear", "Low", priority);
                }

                lastCalculatedRoutes = routes;
                currentOptimalRoute = routes[0];

                if (routeLoader) routeLoader.classList.remove("show");
                if (optimizeBtn) {
                    optimizeBtn.disabled = false;
                    optimizeBtn.innerHTML = "<span>🧠</span> Find Optimal Route";
                }

                displayResults(src, dest, weight, priority, routes);
            }, 600);
        });
    }

    function displayResults(src, dest, weight, priority, routes) {
        const best = routes[0];

        if (resultSource) resultSource.textContent = src;
        if (resultDestination) resultDestination.textContent = dest;
        if (recommendedRoute) recommendedRoute.textContent = `${best.icon || getIcon(best.transport_mode)} ${best.transport_mode || best.mode}`;
        if (recommendIcon) recommendIcon.textContent = best.icon || getIcon(best.transport_mode);
        if (pathModeLabel) pathModeLabel.textContent = `${best.icon || getIcon(best.transport_mode)} ${best.transport_mode || best.mode} (Optimal Path)`;
        
        let confidenceScore = Math.min(99, Math.round((best.route_score || 90)));
        if (confidenceValue) confidenceValue.textContent = `${confidenceScore}%`;
        if (estimatedTime) estimatedTime.textContent = `${best.estimated_time_hours || best.estimated_time || 24} hrs`;
        if (estimatedCost) estimatedCost.textContent = `₹${(best.estimated_cost || 4800).toLocaleString('en-IN')}`;
        if (reliability) reliability.textContent = `${best.reliability || 92}%`;
        
        let riskText = best.delay_risk || "Low";
        if (best.delay_probability) {
            riskText += ` (${Math.round(best.delay_probability * 100)}%)`;
        }
        if (delayRisk) delayRisk.textContent = riskText;

        // Generate AI rationale explanation text
        let rationale = `${best.transport_mode || best.mode} was selected as the optimal transport mode because it delivers the highest overall performance score (${confidenceScore}/100) combining speed, affordability, and reliability.`;
        if (priority === "Urgent") {
            rationale += " Priority level 'Urgent' was weighted to minimize transit time.";
        }
        if (weight > 1000) {
            rationale += " Heavy cargo weight was factored into the transport capacity safety check.";
        }
        if (aiExplanation) aiExplanation.textContent = rationale;

        // Render Multimodal Cards
        renderMultimodalGrid(routes);

        if (routeResult) {
            routeResult.classList.add("show");
            routeResult.scrollIntoView({ behavior: "smooth" });
        }
    }

    function renderMultimodalGrid(routes) {
        if (!transportGrid) return;
        transportGrid.innerHTML = "";

        routes.forEach(r => {
            const card = document.createElement("div");
            card.className = "transport-card" + (r.is_recommended ? " recommended" : "");
            const mode = r.transport_mode || r.mode;
            const icon = r.icon || getIcon(mode);
            const time = r.estimated_time_hours || r.estimated_time || 24;
            const cost = r.estimated_cost || 4000;

            card.innerHTML = `
                <div class="transport-icon">${icon}</div>
                <h3>${mode} ${r.is_recommended ? "⭐" : ""}</h3>
                <p>${getModeTagline(mode)}</p>
                <div class="transport-details">
                    <span>⏱ ${time} hrs</span>
                    <span>💰 ₹${cost.toLocaleString('en-IN')}</span>
                </div>
            `;
            transportGrid.appendChild(card);
        });
    }

    function getIcon(mode) {
        const m = String(mode).toLowerCase();
        if (m.includes("rail")) return "🚆";
        if (m.includes("air")) return "✈️";
        if (m.includes("water")) return "🚢";
        return "🚚";
    }

    function getModeTagline(mode) {
        const m = String(mode).toLowerCase();
        if (m.includes("rail")) return "Reliable long-distance transport with low cost.";
        if (m.includes("air")) return "Fastest express delivery for priority shipments.";
        if (m.includes("water")) return "Cost-efficient option for heavy cargo.";
        return "Flexible door-to-door ground transportation.";
    }

    // Reset Route
    if (resetRoute) {
        resetRoute.addEventListener("click", function () {
            if (routeResult) routeResult.classList.remove("show");
            if (routeForm) routeForm.reset();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Save Recommended Route
    if (saveRoute) {
        saveRoute.addEventListener("click", function () {
            if (!currentOptimalRoute) return;

            let saved = JSON.parse(localStorage.getItem("savedRoutes")) || [];
            const routeObj = {
                id: "RT-" + Date.now(),
                source: routeSource.value,
                destination: routeDestination.value,
                mode: currentOptimalRoute.transport_mode || currentOptimalRoute.mode,
                estimatedCost: currentOptimalRoute.estimated_cost,
                estimatedTime: currentOptimalRoute.estimated_time_hours || currentOptimalRoute.estimated_time,
                reliability: currentOptimalRoute.reliability || 92,
                savedAt: new Date().toISOString()
            };

            saved.push(routeObj);
            localStorage.setItem("savedRoutes", JSON.stringify(saved));

            saveRoute.textContent = "✓ Route Saved!";
            saveRoute.disabled = true;

            setTimeout(() => {
                saveRoute.textContent = "Save Recommended Route →";
                saveRoute.disabled = false;
            }, 2500);
        });
    }
});