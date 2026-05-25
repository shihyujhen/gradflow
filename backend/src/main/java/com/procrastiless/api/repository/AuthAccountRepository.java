package com.procrastiless.api.repository;

import com.procrastiless.api.model.AuthAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthAccountRepository extends JpaRepository<AuthAccount, String> {
}
