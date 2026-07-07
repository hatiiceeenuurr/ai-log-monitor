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
public class AIService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.url}")
    private String apiUrl;

    private final RestClient restClient = RestClient.create();

    public String analyzeLog(String log) {

        AIRequest request = new AIRequest();

        request.setModel("openai/gpt-4.1-mini");
        request.setMax_tokens(500);
        request.setTemperature(0.2);

        request.setMessages(List.of(
                new AIRequest.Message(
                        "user",
                        """
                        You are a senior DevOps and Java engineer.

                        Analyze the following application log.

                        Return ONLY the following format.

                        Problem:
                        <problem>

                        Cause:
                        <cause>

                        Solution:
                        <solution>

                        Log:
                        """ + log
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

