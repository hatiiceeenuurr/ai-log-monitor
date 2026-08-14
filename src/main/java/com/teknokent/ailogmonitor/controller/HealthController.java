package com.teknokent.ailogmonitor.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("backend", "live");

        // Real DB Check
        try {
            if (dataSource.getConnection().isValid(2)) {
                status.put("db", "connected");
            } else {
                status.put("db", "offline");
            }
        } catch (Exception e) {
            status.put("db", "error");
        }

        // Real AI (Ollama) Check
        try {
            URL url = new URL("http://localhost:11434");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(2000);
            connection.connect();
            if (connection.getResponseCode() == 200) {
                status.put("ai", "active");
            } else {
                status.put("ai", "error");
            }
        } catch (Exception e) {
            status.put("ai", "offline");
        }

        // Real Mail (SMTP) Check via Socket
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress("smtp.gmail.com", 587), 2000);
            status.put("mail", "ready");
        } catch (Exception e) {
            status.put("mail", "error");
        }

        return ResponseEntity.ok(status);
    }
}
