package com.teknokent.ailogmonitor.controller;

import com.teknokent.ailogmonitor.dto.auth.AuthRequest;
import com.teknokent.ailogmonitor.dto.auth.AuthResponse;
import com.teknokent.ailogmonitor.dto.auth.RegisterRequest;
import com.teknokent.ailogmonitor.entity.User;
import com.teknokent.ailogmonitor.repository.UserRepository;
import com.teknokent.ailogmonitor.service.auth.JwtTokenProvider;
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

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
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
}
