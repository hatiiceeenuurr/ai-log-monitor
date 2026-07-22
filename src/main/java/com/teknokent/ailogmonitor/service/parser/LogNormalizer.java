package com.teknokent.ailogmonitor.service.parser;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class LogNormalizer {

    public String normalize(String rawLog) {
        if (rawLog == null) return "";

        String normalized = rawLog
                // ISO timestamps / Dates: 2026-07-22T15:45:00.123 or 2026-07-22 15:45:00
                .replaceAll("\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?", "{TIMESTAMP}")
                // IP Addresses with optional ports: 192.168.1.105:8080 or 10.0.1.2
                .replaceAll("\\b(?:\\d{1,3}\\.){3}\\d{1,3}(:\\d+)?\\b", "{IP_ADDRESS}")
                // UUIDs: 123e4567-e89b-12d3-a456-426614174000
                .replaceAll("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}", "{UUID}")
                // Hex numbers / Memory addresses: 0x1a2b3c
                .replaceAll("0x[0-9a-fA-F]+", "{HEX}")
                // Durations & Memory sizes: 1500ms, 4200ms, 65536 bytes, 2048MB, 90%
                .replaceAll("\\d+\\s*(ms|s|MB|GB|KB|bytes|%)", "{METRIC}")
                // Standalone Numbers: 5432, 10000, 42
                .replaceAll("\\b\\d+\\b", "{NUM}");

        return normalized.trim();
    }

    public String generateHash(String normalizedText) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalizedText.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(normalizedText.hashCode());
        }
    }
}
