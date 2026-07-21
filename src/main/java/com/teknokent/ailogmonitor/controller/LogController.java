package com.teknokent.ailogmonitor.controller;

import com.teknokent.ailogmonitor.dto.DailyAnalysisDTO;
import com.teknokent.ailogmonitor.dto.DashboardResponse;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingSearchService;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingService;
import com.teknokent.ailogmonitor.service.report.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import java.util.List;

@RestController
public class LogController {

    private final ReportService reportService;
    private final EmbeddingService embeddingService;
    private final EmbeddingSearchService embeddingSearchService;

    public LogController(
            ReportService reportService,
            EmbeddingService embeddingService,
            EmbeddingSearchService embeddingSearchService) {

        this.reportService = reportService;
        this.embeddingService = embeddingService;
        this.embeddingSearchService = embeddingSearchService;
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

    @GetMapping("/embedding-test")
    public List<Float> embeddingTest() {

        return embeddingService.createEmbedding(
                "ERROR Database connection timeout"
        );
    }

    @GetMapping("/search-test")
    public List<SimilarLogResult> searchTest() {

        return embeddingSearchService.findSimilarLogs(
                "ERROR Database connection timeout"
        );
    }
}