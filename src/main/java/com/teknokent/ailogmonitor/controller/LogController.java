package com.teknokent.ailogmonitor.controller;

import com.teknokent.ailogmonitor.dto.DailyAnalysisDTO;
import com.teknokent.ailogmonitor.dto.DashboardResponse;
import com.teknokent.ailogmonitor.service.report.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class LogController {

    private final ReportService reportService;

    public LogController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {

        return new DashboardResponse(
                reportService.getTotalLogs(),
                reportService.getErrorCount(),
                reportService.getWarnCount(),
                reportService.getLastAnalysisTime(),
                reportService.getRecentLogs()
        );
    }

    @GetMapping("/dashboard/daily")
    public List<DailyAnalysisDTO> getDailyAnalysis() {
        return reportService.getDailyAnalysis();
    }

    @GetMapping("/")
    public String home() {
        return "forward:/index.html";
    }
}