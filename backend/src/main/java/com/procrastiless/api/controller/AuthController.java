package com.procrastiless.api.controller;

import com.procrastiless.api.dto.AuthDtos.*;
import com.procrastiless.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "${app.cors.allowed-origin}")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody AuthRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestHeader(value = "X-User-Email") String email,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        authService.changePassword(email, request);
        return ResponseEntity.noContent().build();
    }
}
