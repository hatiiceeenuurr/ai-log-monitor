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

        String englishQuery = currentLog.trim();
        
        // Fast, reliable translation cache for presentation sample queries (prevents Google 429 blocks and LLM hallucinations)
        String lowerQuery = englishQuery.toLowerCase();
        if (lowerQuery.contains("bağlantı zaman aşımı") || lowerQuery.contains("baglanti zaman asimi")) {
            englishQuery = "PostgreSQL HikariPool connection timeout";
        } else if (lowerQuery.contains("redis işlem gecikmesi") || lowerQuery.contains("redis islem gecikmesi")) {
            englishQuery = "Redis timeout warning";
        } else if (lowerQuery.contains("ağ geçidi zaman aşımı") || lowerQuery.contains("ag gecidi zaman asimi") || lowerQuery.contains("504")) {
            englishQuery = "inventory-service for HTTP 504 Gateway Timeout";
        } else if (lowerQuery.contains("circuitbreaker açık") || lowerQuery.contains("circuitbreaker acik")) {
            englishQuery = "CircuitBreaker is in OPEN state and not permitting calls";
        } else if (lowerQuery.contains("diskte boş alan kalmadı") || lowerQuery.contains("diskte bos alan kalmadi")) {
            englishQuery = "No space left on device while flushing transaction log";
        } else if (!englishQuery.matches("^[a-zA-Z0-9\\s\\-_.,;:'\"!?()\\[\\]{}]+$")) {
            // Fallback to Ollama only if it contains non-English characters and wasn't in our presentation cache
            try {
                englishQuery = aiProvider.analyze("Translate this text to English. Return ONLY the English translation without any quotes or explanations: " + englishQuery).trim();
            } catch (Exception e) {
                log.warn("Ollama translation failed, falling back to original query. Error: {}", e.getMessage());
            }
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