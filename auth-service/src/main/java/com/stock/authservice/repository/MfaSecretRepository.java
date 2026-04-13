package com.stock.authservice.repository;

import com.stock.authservice.entity.MfaSecret;
import com.stock.authservice.entity.MfaSecret.MfaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MfaSecretRepository extends JpaRepository<MfaSecret, String> {

    // Basic queries
    Optional<MfaSecret> findByUserId(String userId);

    boolean existsByUserId(String userId);

    // Verified secrets
    List<MfaSecret> findByIsVerified(Boolean isVerified);

    Optional<MfaSecret> findByUserIdAndIsVerified(String userId, Boolean isVerified);

    // MFA Type queries
    List<MfaSecret> findByMfaType(MfaType mfaType);

    List<MfaSecret> findByMfaTypeAndIsVerified(MfaType mfaType, Boolean isVerified);

    // Count queries
    long countByIsVerified(Boolean isVerified);

    long countByMfaType(MfaType mfaType);

    // Get users with MFA enabled
    @Query("SELECT ms.userId FROM MfaSecret ms WHERE ms.isVerified = true")
    List<String> findUserIdsWithMfaEnabled();

    // Delete by user
    void deleteByUserId(String userId);
}
