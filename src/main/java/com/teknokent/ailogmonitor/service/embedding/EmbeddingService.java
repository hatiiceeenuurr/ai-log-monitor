package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.dto.embedding.EmbeddingRequest;
import com.teknokent.ailogmonitor.dto.embedding.EmbeddingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class EmbeddingService {

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.embedding.model}")
    private String model;

    private final RestClient restClient = RestClient.create();

    public List<Float> createEmbedding(String text) {

        EmbeddingRequest request = new EmbeddingRequest();

        request.setModel(model);
        request.setPrompt(text);

        EmbeddingResponse response = restClient.post()
                .uri(ollamaUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(request)
                .retrieve()
                .body(EmbeddingResponse.class);

        if (response == null || response.getEmbedding() == null) {
            throw new RuntimeException("Embedding oluşturulamadı.");
        }

        return response.getEmbedding();
    }
}