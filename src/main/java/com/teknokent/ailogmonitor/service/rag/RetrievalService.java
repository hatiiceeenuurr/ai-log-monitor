package com.teknokent.ailogmonitor.service.rag;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingSearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RetrievalService {

    private static final Logger log =
            LoggerFactory.getLogger(RetrievalService.class);

    private final EmbeddingSearchService embeddingSearchService;

    @Value("${rag.similarity-threshold}")
    private double similarityThreshold;

    public RetrievalService(EmbeddingSearchService embeddingSearchService) {
        this.embeddingSearchService = embeddingSearchService;
    }

    public List<SimilarLogResult> retrieve(String currentLog) {

        List<SimilarLogResult> results =
                embeddingSearchService.findSimilarLogs(currentLog);

        log.info("Before threshold: {}", results.size());

        results.forEach(result ->
                log.info(
                        "Similarity: {}",
                        String.format("%.2f", result.getSimilarity())
                )
        );

        List<SimilarLogResult> filtered =
                results.stream()
                        .filter(result ->
                                result.getSimilarity() >= similarityThreshold)
                        .toList();

        log.info("After threshold: {}", filtered.size());

        Map<String, SimilarLogResult> uniqueLogs = new LinkedHashMap<>();

        for (SimilarLogResult result : filtered) {

            String logContent = result.getAnalysis().getLogContent();

            if (!uniqueLogs.containsKey(logContent)) {

                uniqueLogs.put(logContent, result);

            } else {

                SimilarLogResult existing = uniqueLogs.get(logContent);

                LogAnalysis currentAnalysis = result.getAnalysis();
                LogAnalysis existingAnalysis = existing.getAnalysis();

                if (currentAnalysis.getAnalyzedAt()
                        .isAfter(existingAnalysis.getAnalyzedAt())) {

                    uniqueLogs.put(logContent, result);
                }
            }
        }

        List<SimilarLogResult> finalResults =
                uniqueLogs.values()
                        .stream()
                        .sorted(Comparator.comparingDouble(
                                SimilarLogResult::getSimilarity).reversed())
                        .limit(5)
                        .toList();

        log.info("After duplicate filter: {}", finalResults.size());

        return finalResults;
    }
}