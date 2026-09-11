/* =========================================================
   MAILROUTE AI - GLOBAL CONFIG & API HELPER
   ========================================================= */

const CONFIG = {
    // API endpoint configuration
    API_BASE_URL: (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
        ? "http://127.0.0.1:5000/api"
        : "/api",
    
    // Status tracking
    isBackendLive: false,

    // Transportation Modes Baseline Data
    TRANSPORT_MODES: {
        Road: { name: "Road", icon: "🚚", costFactor: 12, delayFactor: 0.20, baseSpeedKmH: 50 },
        Rail: { name: "Rail", icon: "🚆", costFactor: 8, delayFactor: 0.10, baseSpeedKmH: 65 },
        Air: { name: "Air", icon: "✈️", costFactor: 35, delayFactor: 0.06, baseSpeedKmH: 500 },
        Water: { name: "Water", icon: "🚢", costFactor: 5, delayFactor: 0.18, baseSpeedKmH: 25 }
    }
};

/**
 * Check if the Flask backend is reachable.
 */
async function checkBackendHealth() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
            method: "GET",
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            CONFIG.isBackendLive = data.success === true;
            return true;
        }
    } catch (e) {
        CONFIG.isBackendLive = false;
    }
    return false;
}

// Initial health check on script load
checkBackendHealth();

/**
 * Unified API Fetch wrapper with fallback support.
 */
async function apiCall(endpoint, method = "GET", payload = null) {
    if (CONFIG.isBackendLive) {
        try {
            const options = {
                method: method,
                headers: { "Content-Type": "application/json" }
            };
            if (payload && method !== "GET") {
                options.body = JSON.stringify(payload);
            }
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn("Backend API request failed, falling back to local mode:", error);
            CONFIG.isBackendLive = false;
        }
    }
    return null;
}

/**
 * Intelligent Client-Side ML Route Optimizer Fallback.
 * Mirrors ml/route_optimizer.py logic accurately.
 */
function runClientRouteOptimizer(distance, weight, weather = "Clear", traffic = "Low", priority = "Medium") {
    const results = [];
    const modes = ["Road", "Rail", "Air", "Water"];

    modes.forEach(modeKey => {
        const modeInfo = CONFIG.TRANSPORT_MODES[modeKey];
        
        // 1. Calculate Estimated Time (hours)
        let speed = modeInfo.baseSpeedKmH;
        if (weather === "Storm") speed *= 0.75;
        if (traffic === "High" && modeKey === "Road") speed *= 0.60;
        let estimatedTime = Math.max(1, Math.round((distance / speed) * 10) / 10);
        
        // 2. Calculate Cost (₹)
        let baseCost = distance * modeInfo.costFactor;
        let weightCost = weight * 0.5;
        let estimatedCost = Math.round(baseCost + weightCost);

        // 3. Calculate Delay Probability
        let delayProb = modeInfo.delayFactor;
        if (weather === "Rain") delayProb += 0.08;
        else if (weather === "Storm") delayProb += 0.20;
        if (traffic === "Medium") delayProb += 0.05;
        else if (traffic === "High") delayProb += 0.12;
        delayProb = Math.min(0.95, Math.round(delayProb * 100) / 100);

        let delayRisk = "Low";
        if (delayProb >= 0.35) delayRisk = "Medium";
        if (delayProb >= 0.55) delayRisk = "High";

        // 4. Calculate Score
        let timeScore = Math.max(0, 100 - estimatedTime);
        let costScore = Math.max(0, 100 - (estimatedCost / 1000));
        let delayScore = 100 - (delayProb * 100);
        let score = (timeScore * 0.40) + (costScore * 0.30) + (delayScore * 0.30);

        // Priority boost
        if (priority === "Urgent" && estimatedTime <= 24) score += 20;
        if (priority === "Low" && estimatedCost <= 5000) score += 15;

        // Weight penalty for air
        if (weight > 1000 && modeKey === "Air") score -= 20;

        let reliability = Math.max(70, Math.round(100 - (delayProb * 100)));

        results.push({
            transport_mode: modeKey,
            mode: modeKey,
            icon: modeInfo.icon,
            distance_km: distance,
            weight_kg: weight,
            estimated_time_hours: estimatedTime,
            estimated_time: estimatedTime,
            estimated_cost: estimatedCost,
            delay_probability: delayProb,
            delay_risk: delayRisk,
            delayRisk: delayRisk,
            reliability: reliability,
            route_score: Math.min(100, Math.round(score * 10) / 10)
        });
    });

    results.sort((a, b) => b.route_score - a.route_score);
    results[0].is_recommended = true;
    for (let i = 1; i < results.length; i++) {
        results[i].is_recommended = false;
    }

    return results;
}

// Global user session helper
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("mailrouteCurrentUser"));
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem("mailrouteCurrentUser", JSON.stringify(user));
    } else {
        localStorage.removeItem("mailrouteCurrentUser");
    }
}
