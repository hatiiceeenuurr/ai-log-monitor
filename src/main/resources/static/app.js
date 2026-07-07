
async function loadDashboard() {

    const response = await fetch("/dashboard");



    const dashboard = dashboardData;

    document.getElementById("totalLogs").innerText = dashboard.totalLogs;
    document.getElementById("errorCount").innerText = dashboard.errorCount;
    document.getElementById("warnCount").innerText = dashboard.warnCount;
    document.getElementById("lastAnalysis").innerText = dashboard.lastAnalysis;

    const recentLogs = document.getElementById("recentLogs");

    recentLogs.innerHTML = "";

    dashboard.recentLogs.forEach(log => {

        const card = document.createElement("div");

        card.className = "log-card";

        card.innerHTML = `

            <h3>${log.logContent}</h3>

            <p><span class="label">Problem:</span> ${log.problem}</p>

            <p><span class="label">Cause:</span> ${log.cause}</p>

            <p><span class="label">Solution:</span> ${log.solution}</p>

            <p><span class="label">Severity:</span> ${log.severity}</p>

            <p><span class="label">Analyzed:</span> ${log.analyzedAt}</p>

        `;

        recentLogs.appendChild(card);

    });

}

loadDashboard();
document
    .getElementById("refreshBtn")
    .addEventListener("click", loadDashboard);

setInterval(loadDashboard,30000);

document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

document
    .getElementById("severityFilter")
    .addEventListener("change", applyFilters);
function applyFilters() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const severity = document
        .getElementById("severityFilter")
        .value;

    const cards = document.querySelectorAll(".log-card");

    cards.forEach(card => {

        const text = card.innerText.toLowerCase();

        const matchesKeyword = text.includes(keyword);

        let matchesSeverity = true;

        if (severity !== "ALL") {

            matchesSeverity =
                text.includes("severity: " + severity.toLowerCase());

        }

        card.style.display =
            matchesKeyword && matchesSeverity
                ? "block"
                : "none";

    });

}