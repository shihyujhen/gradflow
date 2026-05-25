package com.procrastiless.api.service;

import com.procrastiless.api.repository.UserDataRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;

@Component
public class DemoDataInitializer implements ApplicationRunner {
    private static final String DEMO_EMAIL = "demo@gradflow.local";

    private final UserDataRepository userDataRepository;
    private final JdbcTemplate jdbcTemplate;
    private final AuthService authService;

    public DemoDataInitializer(UserDataRepository userDataRepository, JdbcTemplate jdbcTemplate, AuthService authService) {
        this.userDataRepository = userDataRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.authService = authService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        authService.ensureDemoAccount();

        if (userDataRepository.existsById(DEMO_EMAIL)) {
            return;
        }

        ClassPathResource seed = new ClassPathResource("data.sql");
        String sql = StreamUtils.copyToString(seed.getInputStream(), StandardCharsets.UTF_8);
        jdbcTemplate.execute(sql);
    }
}
