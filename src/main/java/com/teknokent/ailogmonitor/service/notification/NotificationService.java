package com.teknokent.ailogmonitor.service.notification;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.priority.Priority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SlackNotificationService slackNotificationService;

    @Value("${notification.enabled:true}")
    private boolean notificationEnabled;

    public NotificationService(
            SlackNotificationService slackNotificationService) {

        this.slackNotificationService = slackNotificationService;
    }

    public void notify(LogAnalysis analysis) {

        if (!notificationEnabled) {
            return;
        }

        if (analysis.getPriority() == Priority.CRITICAL) {

            slackNotificationService.send(analysis);

        }
    }

}
