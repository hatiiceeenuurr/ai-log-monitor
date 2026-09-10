package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogEmbedding;
import com.teknokent.ailogmonitor.service.parser.LogNormalizer;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class EmbeddingSearchService {

    private static final Logger log =
            LoggerFactory.getLogger(EmbeddingSearchService.class);

    private static final double SIMILARITY_THRESHOLD = 70.0; // Minimum 70% threshold

    private final EmbeddingService embeddingService;
    private final EntityManager entityManager;
    private final LogNormalizer logNormalizer;
    private final com.teknokent.ailogmonitor.service.ai.AIProvider aiProvider;

    public EmbeddingSearchService(
            EmbeddingService embeddingService,
            EntityManager entityManager,
            LogNormalizer logNormalizer,
            com.teknokent.ailogmonitor.service.ai.AIProvider aiProvider) {

        this.embeddingService = embeddingService;
        this.entityManager = entityManager;
        this.logNormalizer = logNormalizer;
        this.aiProvider = aiProvider;
    }

    public List<SimilarLogResult> findSimilarLogs(String currentLog) {

        String englishQuery = currentLog;
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" + java.net.URLEncoder.encode(currentLog, java.nio.charset.StandardCharsets.UTF_8);
            String response = restTemplate.getForObject(url, String.class);
            if (response != null && response.startsWith("[[[")) {
                // Parse the deeply nested JSON array [[["translated text", "original text", ...
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(response);
                englishQuery = rootNode.get(0).get(0).get(0).asText();
            }
        } catch (Exception e) {
            log.warn("Google Translate API failed, falling back to original query. Error: {}", e.getMessage());
        }
        
        log.info("Original Query: '{}' -> English Query: '{}'", currentLog, englishQuery);

        String normalizedQuery = (logNormalizer != null && englishQuery != null)
                ? logNormalizer.normalize(englishQuery.trim())
                : englishQuery;

        List<Float> embedding = embeddingService.createEmbedding(normalizedQuery);
        if (embedding == null || embedding.isEmpty()) {
            return Collections.emptyList();
        }

        log.info("Searching for normalized log query: {}", normalizedQuery);

        float[] queryVector = new float[embedding.size()];

        for (int i = 0; i < embedding.size(); i++) {
            queryVector[i] = embedding.get(i);
        }

        List<Object[]> rows =
                entityManager.createQuery("""
                        SELECT le,
                               cosine_distance(le.embedding, :embedding)
                        FROM LogEmbedding le
                        ORDER BY cosine_distance(le.embedding, :embedding)
                        """, Object[].class)
                        .setParameter("embedding", queryVector)
                        .setMaxResults(10)
                        .getResultList();
        log.info("Candidate rows from database: {}", rows.size());

        List<SimilarLogResult> results = new ArrayList<>();

        for (Object[] row : rows) {

            LogEmbedding embeddingResult = (LogEmbedding) row[0];
            double distance = ((Number) row[1]).doubleValue();

            // Calculate raw cosine similarity percentage
            double rawSimilarity = (1.0 - distance) * 100.0;
            rawSimilarity = Math.clamp(rawSimilarity, 0.0, 100.0);

            // Strict Threshold Filtering: Filter out irrelevant logs below threshold
            if (rawSimilarity < SIMILARITY_THRESHOLD) {
                log.info("Candidate ID {} skipped due to low similarity ({}% < {}%)",
                        embeddingResult.getLogAnalysis().getId(), 
                        String.format("%.2f", rawSimilarity), 
                        String.format("%.0f", SIMILARITY_THRESHOLD));
                continue;
            }

            // Calibrated Linear Scaling: Map [70%, 100%] to dynamic intuitive range [30%, 98%]
            double calibratedSimilarity = ((rawSimilarity - SIMILARITY_THRESHOLD) / (100.0 - SIMILARITY_THRESHOLD)) * 68.0 + 30.0;
            calibratedSimilarity = Math.clamp(calibratedSimilarity, 30.0, 99.0);

            log.info(
                    "LogId={} RawSimilarity={}% CalibratedSimilarity={}% Distance={}",
                    embeddingResult.getLogAnalysis().getId(),
                    String.format("%.2f", rawSimilarity),
                    String.format("%.2f", calibratedSimilarity),
                    String.format("%.4f", distance)
            );

            results.add(
                    new SimilarLogResult(
                            embeddingResult.getLogAnalysis(),
                            calibratedSimilarity,
                            distance
                    )
            );
            if (results.size() == 5) {
                break;
            }
        }

        log.info("EmbeddingSearchService returned {} high-precision results.", results.size());
        return results;
    }
}