package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.entity.LogEmbedding;
import com.teknokent.ailogmonitor.repository.LogEmbeddingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingStorageService {

    private static final Logger log =
            LoggerFactory.getLogger(EmbeddingStorageService.class);

    private final EmbeddingService embeddingService;
    private final LogEmbeddingRepository repository;

    public EmbeddingStorageService(
            EmbeddingService embeddingService,
            LogEmbeddingRepository repository) {

        this.embeddingService = embeddingService;
        this.repository = repository;
    }

    public void saveEmbedding(LogAnalysis analysis) {

        log.info("Creating normalized embedding for LogAnalysis ID={}", analysis.getId());

        // Use noise-reduced normalized message for precise vector embedding
        String textToEmbed = (analysis.getNormalizedMessage() != null && !analysis.getNormalizedMessage().isBlank())
                ? analysis.getNormalizedMessage()
                : analysis.getLogContent();

        List<Float> embedding = embeddingService.createEmbedding(textToEmbed);

        if (embedding == null || embedding.isEmpty()) {
            log.warn("Embedding servisi yanıt vermedi, vektör kaydı atlandı. LogAnalysis ID={}", analysis.getId());
            return;
        }

        if (log.isDebugEnabled() && embedding.size() >= 10) {
            log.debug("Embedding first 10 values: {}", embedding.subList(0, 10));
        }

        float[] vector = new float[embedding.size()];

        for (int i = 0; i < embedding.size(); i++) {
            vector[i] = embedding.get(i);
        }

        LogEmbedding entity = new LogEmbedding();
        entity.setLogAnalysis(analysis);
        entity.setEmbedding(vector);

        repository.save(entity);

        log.info("Normalized embedding saved successfully. LogAnalysis ID={}", analysis.getId());
    }
}