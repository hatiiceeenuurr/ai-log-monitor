package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.dto.embedding.EmbeddingRequest;
import com.teknokent.ailogmonitor.dto.embedding.EmbeddingResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class EmbeddingService {

    private static final Logger log =
            LoggerFactory.getLogger(EmbeddingService.class);

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.embedding.model}")
    private String model;

    private final RestClient restClient = RestClient.create();

    public List<Float> createEmbedding(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be null or blank.");
        }

        EmbeddingRequest request = new EmbeddingRequest();
        request.setModel(model);
        request.setPrompt(text);

        try {

            log.debug("Creating embedding using model '{}'.", model);

            EmbeddingResponse response = restClient.post()
                    .uri(ollamaUrl)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(request)
                    .retrieve()
                    .body(EmbeddingResponse.class);

            if (response == null || response.getEmbedding() == null) {
                throw new IllegalStateException("Embedding could not be created.");
            }

            log.debug("Embedding created successfully. Dimension={}",
                    response.getEmbedding().size());

            return response.getEmbedding();

        } catch (Exception e) {

            log.error("Failed to create embedding.", e);
            throw e;
        }
    }
}