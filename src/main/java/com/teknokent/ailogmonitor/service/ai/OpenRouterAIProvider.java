package com.teknokent.ailogmonitor.service.ai;

import com.teknokent.ailogmonitor.dto.ai.AIRequest;
import com.teknokent.ailogmonitor.dto.ai.OpenRouterResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class OpenRouterAIProvider implements AIProvider {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.url}")
    private String apiUrl;

    private final RestClient restClient = RestClient.create();

    @Override
    public String analyze(String prompt) {

        AIRequest request = new AIRequest();

        request.setModel("openai/gpt-4.1-mini");
        request.setMax_tokens(500);
        request.setTemperature(0.2);

        request.setMessages(List.of(
                new AIRequest.Message(
                        "user",
                        prompt
                )
        ));

        OpenRouterResponse response = restClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(request)
                .retrieve()
                .body(OpenRouterResponse.class);

        if (response == null
                || response.getChoices() == null
                || response.getChoices().isEmpty()
                || response.getChoices().get(0).getMessage() == null) {

            return "No response received from AI.";
        }

        return response.getChoices()
                .get(0)
                .getMessage()
                .getContent();
    }
}

