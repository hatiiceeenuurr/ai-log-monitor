package com.teknokent.ailogmonitor.config;

import com.teknokent.ailogmonitor.entity.User;
import com.teknokent.ailogmonitor.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User(
                        "admin",
                        passwordEncoder.encode("admin123"),
                        "admin@ailogmonitor.com",
                        "ADMIN"
                );
                userRepository.save(admin);
                log.info("Default Admin User created successfully: username=admin, password=admin123");
            } else {
                log.info("Default Admin User already exists: username=admin");
            }
        } catch (Exception e) {
            log.error("Failed to seed default admin user into database: {}", e.getMessage(), e);
        }
    }
}
