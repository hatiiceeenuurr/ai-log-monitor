package com.teknokent.ailogmonitor.service.notification;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.priority.Priority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SlackNotificationService slackNotificationService;
    private final SseNotificationService sseNotificationService;

    @Value("${notification.enabled:true}")
    private boolean notificationEnabled;

    public NotificationService(
            SlackNotificationService slackNotificationService,
            SseNotificationService sseNotificationService) {

        this.slackNotificationService = slackNotificationService;
        this.sseNotificationService = sseNotificationService;
    }

    public void notify(LogAnalysis analysis) {
        // Broadcast SSE live event to connected frontend clients
        sseNotificationService.emit(analysis);

        if (!notificationEnabled) {
            return;
        }

        if (analysis.getPriority() == Priority.CRITICAL) {
            slackNotificationService.send(analysis);
        }
    }
}
