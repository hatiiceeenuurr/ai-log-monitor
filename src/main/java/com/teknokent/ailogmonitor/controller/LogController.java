package com.teknokent.ailogmonitor.controller;

import com.teknokent.ailogmonitor.dto.DailyAnalysisDTO;
import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingSearchService;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingService;
import com.teknokent.ailogmonitor.service.report.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
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

    @GetMapping("/logs")
    public List<LogAnalysis> getAllLogs() {
        return reportService.getAllLogs();
    }

    @GetMapping("/logs/page")
    public Page<LogAnalysis> getLogsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reportService.getLogsPaginated(pageable);
    }

    @GetMapping("/dashboard/daily")
    public List<DailyAnalysisDTO> getDailyAnalysis() {
        return reportService.getDailyAnalysis();
    }

    @GetMapping("/search")
    public List<SimilarLogResult> searchLogs(@RequestParam(defaultValue = "ERROR Database connection timeout") String query) {
        return embeddingSearchService.findSimilarLogs(query);
    }

    @PostMapping("/admin/reset-data")
    public Map<String, String> resetData() {
        reportService.resetAllData();
        return Map.of("message", "Tüm analiz verileri başarıyla sıfırlandı.");
    }
}