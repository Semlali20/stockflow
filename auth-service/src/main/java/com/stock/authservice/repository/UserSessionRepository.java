package com.stock.authservice.repository;

import com.stock.authservice.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {

    // Basic queries
    Optional<UserSession> findBySessionToken(String sessionToken);

    List<UserSession> findByUserId(String userId);

    // Active sessions
    List<UserSession> findByIsActive(Boolean isActive);
    List<UserSession> findByExpiresAtBeforeAndIsActive(LocalDateTime now, boolean isActive);

    List<UserSession> findByUserIdAndIsActive(String userId, Boolean isActive);

    @Query("SELECT us FROM UserSession us WHERE us.userId = :userId AND us.isActive = true AND us.expiresAt > :now")
    List<UserSession> findActiveSessionsByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);

    // Expired sessions
    @Query("SELECT us FROM UserSession us WHERE us.expiresAt <= :now")
    List<UserSession> findExpiredSessions(@Param("now") LocalDateTime now);

    @Query("SELECT us FROM UserSession us WHERE us.userId = :userId AND us.expiresAt <= :now")
    List<UserSession> findExpiredSessionsByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);

    // IP-based queries
    List<UserSession> findByIpAddress(String ipAddress);

    @Query("SELECT us FROM UserSession us WHERE us.userId = :userId AND us.ipAddress = :ipAddress AND us.isActive = true")
    List<UserSession> findActiveSessionsByUserIdAndIp(
            @Param("userId") String userId,
            @Param("ipAddress") String ipAddress
    );

    // Device-based queries
    List<UserSession> findByUserIdAndDeviceType(String userId, String deviceType);

    // Terminate sessions
    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false WHERE us.userId = :userId")
    void terminateAllUserSessions(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false WHERE us.sessionToken = :sessionToken")
    void terminateSession(@Param("sessionToken") String sessionToken);

    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false WHERE us.id = :sessionId")
    void terminateSessionById(@Param("sessionId") String sessionId);

    // Delete operations
    @Modifying
    @Query("DELETE FROM UserSession us WHERE us.userId = :userId")
    void deleteByUserId(@Param("userId") String userId);

    @Modifying
    @Query("DELETE FROM UserSession us WHERE us.expiresAt <= :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM UserSession us WHERE us.isActive = false AND us.updatedAt < :cutoffDate")
    void deleteInactiveSessions(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Count queries
    long countByUserId(String userId);

    long countByUserIdAndIsActive(String userId, Boolean isActive);

    @Query("SELECT COUNT(us) FROM UserSession us WHERE us.userId = :userId AND us.isActive = true AND us.expiresAt > :now")
    long countActiveSessionsByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);

    // Last activity
    @Query("SELECT us FROM UserSession us WHERE us.userId = :userId ORDER BY us.lastActivity DESC")
    List<UserSession> findSessionsOrderedByActivity(@Param("userId") String userId);

    // Statistics
    @Query("SELECT us.userId, COUNT(us) FROM UserSession us WHERE us.isActive = true GROUP BY us.userId")
    List<Object[]> countActiveSessionsPerUser();

    @Query("SELECT COUNT(DISTINCT us.userId) FROM UserSession us WHERE us.isActive = true AND us.lastActivity >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);
}
