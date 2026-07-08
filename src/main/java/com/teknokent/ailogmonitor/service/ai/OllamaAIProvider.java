package com.teknokent.ailogmonitor.service.ai;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@Primary
public class OllamaAIProvider implements AIProvider {

    @Value("${ollama.chat.url}")
    private String url;

    @Value("${ollama.chat.model}")
    private String model;

    private final RestClient restClient = RestClient.create();

    @Override
    public String analyze(String prompt) {

        Map<String, Object> request = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
        );

        Map<?, ?> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("response") == null) {
            throw new RuntimeException("Ollama cevap döndürmedi.");
        }

        return response.get("response").toString();
    }
}
