package com.procrastiless.api.service;

import com.procrastiless.api.dto.AuthDtos.*;
import com.procrastiless.api.model.AuthAccount;
import com.procrastiless.api.repository.AuthAccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Locale;

@Service
public class AuthService {
    private static final int ITERATIONS = 120_000;
    private static final int KEY_LENGTH = 256;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AuthAccountRepository authAccountRepository;

    public AuthService(AuthAccountRepository authAccountRepository) {
        this.authAccountRepository = authAccountRepository;
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        String email = normalizeEmail(request.email());
        if (authAccountRepository.existsById(email)) {
            throw new IllegalArgumentException("This email is already registered.");
        }
        AuthAccount account = new AuthAccount();
        account.setEmail(email);
        setPassword(account, request.password());
        account.setCreatedAt(LocalDateTime.now());
        authAccountRepository.save(account);
        return toResponse(account);
    }

    public AuthResponse login(AuthRequest request) {
        String email = normalizeEmail(request.email());
        AuthAccount account = authAccountRepository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("Email or password is incorrect."));
        if (!verifyPassword(request.password(), account)) {
            throw new IllegalArgumentException("Email or password is incorrect.");
        }
        return toResponse(account);
    }

    @Transactional
    public void changePassword(String email, PasswordChangeRequest request) {
        AuthAccount account = authAccountRepository.findById(normalizeEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        if (!verifyPassword(request.currentPassword(), account)) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        setPassword(account, request.newPassword());
        account.setUpdatedAt(LocalDateTime.now());
        authAccountRepository.save(account);
    }

    @Transactional
    public void ensureDemoAccount() {
        String demoEmail = "demo@gradflow.local";
        if (authAccountRepository.existsById(demoEmail)) {
            return;
        }
        AuthAccount account = new AuthAccount();
        account.setEmail(demoEmail);
        setPassword(account, "demo1234");
        account.setCreatedAt(LocalDateTime.now());
        authAccountRepository.save(account);
    }

    private void setPassword(AuthAccount account, String password) {
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        account.setPasswordSalt(Base64.getEncoder().encodeToString(salt));
        account.setPasswordHash(hashPassword(password, salt));
    }

    private boolean verifyPassword(String password, AuthAccount account) {
        byte[] salt = Base64.getDecoder().decode(account.getPasswordSalt());
        String hash = hashPassword(password, salt);
        return hash.equals(account.getPasswordHash());
    }

    private String hashPassword(String password, byte[] salt) {
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return Base64.getEncoder().encodeToString(factory.generateSecret(spec).getEncoded());
        } catch (Exception e) {
            throw new IllegalStateException("Could not hash password.", e);
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private AuthResponse toResponse(AuthAccount account) {
        return new AuthResponse(account.getEmail(), account.getCreatedAt());
    }
}
