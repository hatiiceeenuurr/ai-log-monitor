/**
 * Exports an array of log objects to a downloadable CSV file.
 * @param {Array} logs - List of log analysis items
 * @param {String} filename - Name of the file to save
 */
export function exportLogsToCSV(logs, filename = 'ai_log_analysis_report.csv') {
    if (!logs || !logs.length) {
        alert("No data available to export.");
        return;
    }

    const headers = ["ID", "Analyzed At", "Severity", "Priority", "Problem", "Cause", "Solution", "Occurrences"];
    
    const csvRows = [];
    csvRows.push(headers.join(","));

    logs.forEach(log => {
        const row = [
            log.id || '',
            log.analyzedAt ? `"${new Date(log.analyzedAt).toLocaleString()}"` : '""',
            `"${(log.severity || '').replace(/"/g, '""')}"`,
            `"${(log.priority || '').replace(/"/g, '""')}"`,
            `"${(log.problem || '').replace(/"/g, '""')}"`,
            `"${(log.cause || '').replace(/"/g, '""')}"`,
            `"${(log.solution || '').replace(/"/g, '""')}"`,
            log.occurrenceCount || 1
        ];
        csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
