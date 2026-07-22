package com.teknokent.ailogmonitor.service.simulation;

import com.teknokent.ailogmonitor.model.LogScenario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class ScenarioService {

    private final Random random = new Random();

    private final List<String> services = List.of(
            "order-service", "user-service", "payment-service", "inventory-service",
            "auth-service", "notification-service", "api-gateway"
    );

    private final List<String> dbTables = List.of(
            "users", "orders", "payments", "products", "user_sessions", "transactions"
    );

    private final List<String> endpoints = List.of(
            "/api/v1/orders/checkout", "/api/v1/users/login", "/api/v1/payments/charge",
            "/api/v1/inventory/deduct", "/api/v1/auth/refresh", "/api/v1/notifications/send"
    );

    public LogScenario getRandomScenario() {
        int choice = random.nextInt(8);
        return switch (choice) {
            case 0 -> createDatabaseTimeoutScenario();
            case 1 -> createRedisLatencyScenario();
            case 2 -> createMemoryLeakScenario();
            case 3 -> createSecurityViolationScenario();
            case 4 -> createHttpGatewayErrorScenario();
            case 5 -> createKafkaBrokerFailureScenario();
            case 6 -> createDiskSpaceWarningScenario();
            default -> createCircuitBreakerScenario();
        };
    }

    private LogScenario createDatabaseTimeoutScenario() {
        String service = getRandom(services);
        String table = getRandom(dbTables);
        int port = 5432;
        int durationMs = 3000 + random.nextInt(7000);
        String ip = "10.0.%d.%d".formatted(random.nextInt(10), random.nextInt(250));

        List<String> logs = List.of(
                "INFO [%s] Connecting to PostgreSQL database on %s:%d".formatted(service, ip, port),
                "WARN [%s] Query executed on '%s' table exceeded threshold: %dms".formatted(service, table, durationMs),
                "ERROR [%s] HikariPool-1 - Connection is not available, request timed out after %dms.".formatted(service, durationMs),
                "ERROR [%s] java.sql.SQLTransientConnectionException: Could not connect to PostgreSQL server on %s:%d".formatted(service, ip, port)
        );
        return new LogScenario("Database Connection Timeout", logs);
    }

    private LogScenario createRedisLatencyScenario() {
        String service = getRandom(services);
        int latency = 1500 + random.nextInt(3500);
        String key = "cache:" + getRandom(dbTables) + ":" + random.nextInt(10000);

        List<String> logs = List.of(
                "INFO [%s] Connecting to Redis master node at 127.0.0.1:6379".formatted(service),
                "WARN [%s] High Redis operation latency detected for key '%s': %dms".formatted(service, key, latency),
                "ERROR [%s] org.springframework.data.redis.RedisConnectionFailureException: Unable to connect to Redis; nested exception is io.netty.channel.AbstractChannel$AnnotatedConnectException: Connection refused".formatted(service)
        );
        return new LogScenario("Redis Latency & Failure", logs);
    }

    private LogScenario createMemoryLeakScenario() {
        String service = getRandom(services);
        int heapPct = 85 + random.nextInt(12);

        List<String> logs = List.of(
                "INFO [%s] JVM initialized with MaxHeapSize=2048M".formatted(service),
                "WARN [%s] Garbage collection duration 4200ms; Heap memory usage reached %d%%".formatted(service, heapPct),
                "ERROR [%s] java.lang.OutOfMemoryError: Java heap space failed to allocate 65536 bytes".formatted(service)
        );
        return new LogScenario("JVM OutOfMemoryError", logs);
    }

    private LogScenario createSecurityViolationScenario() {
        String endpoint = getRandom(endpoints);
        String ip = "192.168.%d.%d".formatted(random.nextInt(5), random.nextInt(255));
        int attempts = 5 + random.nextInt(20);

        List<String> logs = List.of(
                "INFO [auth-service] Incoming request from IP %s to %s".formatted(ip, endpoint),
                "WARN [auth-service] Multiple failed authentication attempts (%d) from IP %s".formatted(attempts, ip),
                "ERROR [auth-service] SecurityException: Invalid JWT signature or expired token for request from %s".formatted(ip)
        );
        return new LogScenario("Security Authentication Violation", logs);
    }

    private LogScenario createHttpGatewayErrorScenario() {
        String endpoint = getRandom(endpoints);
        int statusCode = random.nextBoolean() ? 502 : 504;
        String service = getRandom(services);

        List<String> logs = List.of(
                "INFO [api-gateway] Routing request to %s via %s".formatted(endpoint, service),
                "WARN [api-gateway] Response delay threshold exceeded (5000ms) for endpoint %s".formatted(endpoint),
                "ERROR [api-gateway] HTTP %d %s for upstream service %s on %s".formatted(
                        statusCode,
                        statusCode == 502 ? "Bad Gateway" : "Gateway Timeout",
                        service,
                        endpoint
                )
        );
        return new LogScenario("API Gateway Upstream Error", logs);
    }

    private LogScenario createKafkaBrokerFailureScenario() {
        String topic = "events." + getRandom(dbTables);
        int partition = random.nextInt(4);

        List<String> logs = List.of(
                "INFO [notification-service] Subscribing to Kafka topic '%s'".formatted(topic),
                "WARN [notification-service] Kafka consumer group rebalance in progress for topic %s, partition %d".formatted(topic, partition),
                "ERROR [notification-service] org.apache.kafka.common.errors.TimeoutException: Failed to update metadata after 60000 ms for topic %s".formatted(topic)
        );
        return new LogScenario("Kafka Broker Unreachable", logs);
    }

    private LogScenario createDiskSpaceWarningScenario() {
        int freeMb = 50 + random.nextInt(450);

        List<String> logs = List.of(
                "INFO [system-monitor] Storage check executed on /var/log volume",
                "WARN [system-monitor] Low disk space warning: Only %dMB remaining on /var/log".formatted(freeMb),
                "ERROR [system-monitor] java.io.IOException: No space left on device while flushing transaction log".formatted()
        );
        return new LogScenario("Low Disk Space I/O Exception", logs);
    }

    private LogScenario createCircuitBreakerScenario() {
        String service = getRandom(services);
        int failureRate = 60 + random.nextInt(35);

        List<String> logs = List.of(
                "INFO [%s] Calling external payment provider API".formatted(service),
                "WARN [%s] CircuitBreaker '%s-cb' failure rate is %d%% (threshold: 50%%)".formatted(service, service, failureRate),
                "ERROR [%s] io.github.resilience4j.circuitbreaker.CallNotPermittedException: CircuitBreaker '%s-cb' is OPEN and does not permit further calls".formatted(service, service)
        );
        return new LogScenario("Circuit Breaker OPEN State", logs);
    }

    private <T> T getRandom(List<T> list) {
        return list.get(random.nextInt(list.size()));
    }
}
