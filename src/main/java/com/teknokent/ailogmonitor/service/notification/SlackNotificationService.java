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

    private final RestTemplate restTemplate = new RestTemplate();
    private final com.teknokent.ailogmonitor.repository.AppSettingRepository appSettingRepository;

    public SlackNotificationService(com.teknokent.ailogmonitor.repository.AppSettingRepository appSettingRepository) {
        this.appSettingRepository = appSettingRepository;
    }


    public void send(LogAnalysis analysis) {
        // 1. Check if Slack is enabled
        String isEnabled = appSettingRepository.findById("slack_enabled")
                .map(com.teknokent.ailogmonitor.entity.AppSetting::getSettingValue)
                .orElse("false");

        if (!"true".equalsIgnoreCase(isEnabled)) {
            System.out.println("SLACK NOTIFICATION -> Skipping alert (Slack integration is disabled in settings).");
            return;
        }

        // 2. Get the Webhook URL
        String webhookUrl = appSettingRepository.findById("slack_webhook_url")
                .map(com.teknokent.ailogmonitor.entity.AppSetting::getSettingValue)
                .orElse(null);

        if (webhookUrl == null || webhookUrl.isBlank() || !webhookUrl.startsWith("http")) {
            System.out.println("SLACK NOTIFICATION -> Skipping alert (Webhook URL is not configured).");
            return;
        }

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
