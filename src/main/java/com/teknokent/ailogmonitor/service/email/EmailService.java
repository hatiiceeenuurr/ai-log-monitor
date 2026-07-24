package com.teknokent.ailogmonitor.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String recipientEmail, String otpCode) {
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipientEmail);
                String timeStr = java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"));
                message.setSubject("AI Log Monitor - Password Reset Code [" + timeStr + "]");
                message.setText("Hello,\n\n"
                        + "Your 6-digit OTP verification code for resetting your AI Log Monitor password is: " + otpCode + "\n\n"
                        + "This code is valid for 10 minutes. If you did not request this, please ignore this email.\n\n"
                        + "Best regards,\nAI Log Monitor Security Team");

                mailSender.send(message);
                log.info("OTP verification email sent successfully to {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send SMTP email to {}: {}", recipientEmail, e.getMessage());
            }
        } else {
            log.warn("JavaMailSender is not configured. Email to {} could not be dispatched via SMTP.", recipientEmail);
        }
    }
}
