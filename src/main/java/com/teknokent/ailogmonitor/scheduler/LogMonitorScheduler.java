package com.teknokent.ailogmonitor.scheduler;

import com.teknokent.ailogmonitor.entity.Scan;
import com.teknokent.ailogmonitor.model.LogEntry;
import com.teknokent.ailogmonitor.model.Severity;
import com.teknokent.ailogmonitor.service.log.LogReaderService;
import com.teknokent.ailogmonitor.service.parser.LogParserService;
import com.teknokent.ailogmonitor.service.rag.RagService;
import com.teknokent.ailogmonitor.service.report.ReportService;
import com.teknokent.ailogmonitor.service.scan.ScanService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class LogMonitorScheduler {

    private final LogReaderService logReaderService;
    private final LogParserService logParserService;
    private final RagService ragService;
    private final ReportService reportService;
    private final ScanService scanService;

    public LogMonitorScheduler(LogReaderService logReaderService,
                               LogParserService logParserService,
                               RagService ragService,
                               ReportService reportService,
                               ScanService scanService) {

        this.logReaderService = logReaderService;
        this.logParserService = logParserService;
        this.ragService = ragService;
        this.reportService = reportService;
        this.scanService = scanService;
    }

    @Scheduled(fixedDelayString = "${monitor.interval}")
    public void analyzeLogs() throws IOException {

        List<String> logs = logReaderService.readLogs();

        List<LogEntry> logEntries = logParserService.parseLogs(logs);

        Scan scan = scanService.startScan(logs.size());

        int errorCount = 0;
        int warnCount = 0;

        for (LogEntry entry : logEntries) {

            if (entry.getSeverity() == Severity.ERROR) {
                errorCount++;
            } else if (entry.getSeverity() == Severity.WARN) {
                warnCount++;
            }

            String aiResponse = ragService.analyze(entry.getContent());

            reportService.saveAnalysis(
                    scan,
                    entry.getContent(),
                    entry.getSeverity().name(),
                    aiResponse
            );
        }

        scanService.completeScan(
                scan,
                errorCount,
                warnCount
        );

        System.out.println("Scan completed successfully.");
    }
}