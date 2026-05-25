package com.procrastiless.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.procrastiless.api.model.UserData;
import com.procrastiless.api.model.UserDataState;
import com.procrastiless.api.repository.UserDataRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserDataStore {
    private final UserDataRepository userDataRepository;
    private final ObjectMapper objectMapper;

    public UserDataStore(UserDataRepository userDataRepository, ObjectMapper objectMapper) {
        this.userDataRepository = userDataRepository;
        this.objectMapper = objectMapper;
    }

    public UserDataState load(String email) {
        return userDataRepository.findById(email)
                .map(UserData::getPayload)
                .map(this::readPayload)
                .orElseGet(UserDataState::new);
    }

    public UserDataState save(String email, UserDataState state) {
        UserData userData = userDataRepository.findById(email).orElseGet(UserData::new);
        userData.setEmail(email);
        userData.setPayload(writePayload(state));
        userData.setUpdatedAt(LocalDateTime.now());
        userDataRepository.save(userData);
        return state;
    }

    private UserDataState readPayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return new UserDataState();
        }
        try {
            return objectMapper.readValue(payload, UserDataState.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Stored user data is not valid JSON.", e);
        }
    }

    private String writePayload(UserDataState state) {
        try {
            return objectMapper.writeValueAsString(state);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialize user data.", e);
        }
    }
}
