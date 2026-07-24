package com.teknokent.ailogmonitor.controller;

import com.teknokent.ailogmonitor.dto.auth.AuthRequest;
import com.teknokent.ailogmonitor.dto.auth.AuthResponse;
import com.teknokent.ailogmonitor.dto.auth.RegisterRequest;
import com.teknokent.ailogmonitor.entity.User;
import com.teknokent.ailogmonitor.repository.UserRepository;
import com.teknokent.ailogmonitor.service.auth.JwtTokenProvider;
import com.teknokent.ailogmonitor.service.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    private final EmailService emailService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            if (request == null || request.getUsername() == null || request.getUsername().isBlank()
                    || request.getPassword() == null || request.getPassword().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Lütfen kullanıcı adı ve şifrenizi giriniz!"));
            }

            String username = request.getUsername().trim();
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Kullanıcı adı veya şifre hatalı!"));
            }

            User user = userOptional.get();

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Kullanıcı adı veya şifre hatalı!"));
            }

            String token = tokenProvider.generateToken(user.getUsername(), user.getRole());
            log.info("User logged in successfully: {}", user.getUsername());

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole()
            ));
        } catch (Exception e) {
            log.error("Login hatası:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Giriş yapılırken sunucu hatası oluştu: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (request == null || request.getUsername() == null || request.getUsername().isBlank()
                    || request.getPassword() == null || request.getPassword().isBlank()
                    || request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Lütfen tüm alanları (Kullanıcı Adı, E-posta, Şifre) doldurunuz!"));
            }

            String username = request.getUsername().trim();
            String email = request.getEmail().trim();
            String password = request.getPassword().trim();

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Bu kullanıcı adı zaten kullanılıyor!"));
            }

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Bu e-posta adresi zaten kullanılıyor!"));
            }

            User newUser = new User(
                    username,
                    passwordEncoder.encode(password),
                    email,
                    "USER"
            );

            userRepository.save(newUser);
            log.info("New user registered successfully: username={}, email={}", username, email);

            String token = tokenProvider.generateToken(newUser.getUsername(), newUser.getRole());

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    newUser.getUsername(),
                    newUser.getEmail(),
                    newUser.getRole()
            ));
        } catch (Exception e) {
            log.error("Register hatası:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Kullanıcı kaydı oluşturulurken hata oluştu: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> user = userRepository.findByUsername(principal.getName());
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User u = user.get();
        return ResponseEntity.ok(Map.of(
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole()
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || currentPassword.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please fill in all password fields."));
        }

        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect."));
        }

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);
        log.info("Password updated successfully for user: {}", user.getUsername());

        return ResponseEntity.ok(Map.of("message", "Password updated successfully!"));
    }

    private static final Map<String, OtpEntry> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

    private record OtpEntry(String code, java.time.LocalDateTime expiresAt) {}

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter your registered email address!"));
        }

        email = email.trim();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(email);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No registered account found with this email or username!"));
        }

        User user = userOpt.get();
        String otpCode = String.format("%06d", new java.util.Random().nextInt(999999));
        OtpEntry entry = new OtpEntry(otpCode, java.time.LocalDateTime.now().plusMinutes(10));
        otpStore.put(user.getEmail().toLowerCase(), entry);
        otpStore.put(user.getUsername().toLowerCase(), entry);

        emailService.sendOtpEmail(user.getEmail(), otpCode);

        return ResponseEntity.ok(Map.of(
                "message", "Verification code sent to your email address! (Valid for 10 minutes)",
                "email", user.getEmail()
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String inputIdentifier = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");

        if (inputIdentifier == null || inputIdentifier.isBlank() || code == null || code.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please fill in all fields (Email, Verification Code, New Password)!"));
        }

        String key = inputIdentifier.trim().toLowerCase();
        OtpEntry entry = otpStore.get(key);

        // Fallback: If key not found, lookup user by email or username
        if (entry == null) {
            Optional<User> userOpt = userRepository.findByEmail(key);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsername(key);
            }
            if (userOpt.isPresent()) {
                entry = otpStore.get(userOpt.get().getEmail().toLowerCase());
            }
        }

        if (entry == null || !entry.code().equals(code.trim())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code!"));
        }

        if (java.time.LocalDateTime.now().isAfter(entry.expiresAt())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code has expired! Please request a new code."));
        }

        Optional<User> userOpt = userRepository.findByEmail(key);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(key);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User account not found!"));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        otpStore.remove(user.getEmail().toLowerCase());
        otpStore.remove(user.getUsername().toLowerCase());

        log.info("Password reset successfully via OTP verification for user: {}", user.getUsername());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully! You can now log in with your new password."));
    }
}
