package com.teknokent.ailogmonitor.service.notification;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SlackNotificationService {

    @Value("${slack.webhook.url}")
    private String webhookUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void send(LogAnalysis analysis) {
        System.out.println("SLACK NOTIFICATION -> " + analysis.getPriority());
        String message = """
                🚨 *AI LOG MONITOR*

                *Priority:* %s
                *Severity:* %s

                *Problem*
                %s

                *Cause*
                %s

                *Solution*
                %s
                """.formatted(
                analysis.getPriority(),
                analysis.getSeverity(),
                analysis.getProblem(),
                analysis.getCause(),
                analysis.getSolution()
        );

        SlackMessage payload = new SlackMessage(message);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<SlackMessage> entity =
                new HttpEntity<>(payload, headers);

        restTemplate.postForEntity(
                webhookUrl,
                entity,
                String.class
        );
    }
}
