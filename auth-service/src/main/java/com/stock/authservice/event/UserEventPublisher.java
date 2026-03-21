package com.stock.authservice.event;

import com.stock.authservice.constants.KafkaTopics;
import com.stock.authservice.event.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // ==================== USER LIFECYCLE EVENTS ====================

    public void publishUserCreated(UserCreatedEvent event) {
        log.info("Publishing user.created event for user: {}", event.getUserId());
        try {
            kafkaTemplate.send(KafkaTopics.USER_CREATED, event.getUserId(), event);
        } catch (Exception e) {
            log.error("Failed to publish user.created event", e);
        }
    }

    public void publishUserUpdated(UserUpdatedEvent event) {
        publishEvent(KafkaTopics.USER_UPDATED, event.getUserId(), event);
    }

    public void publishUserDeleted(UserDeletedEvent event) {
        publishEvent(KafkaTopics.USER_DELETED, event.getUserId(), event);
    }

    public void publishUserActivated(String userId, String username) {
        publishEvent(KafkaTopics.USER_ACTIVATED, userId,
                java.util.Map.of("userId", userId, "username", username, "timestamp", java.time.LocalDateTime.now()));
    }

    public void publishUserDeactivated(String userId, String username) {
        publishEvent(KafkaTopics.USER_DEACTIVATED, userId,
                java.util.Map.of("userId", userId, "username", username, "timestamp", java.time.LocalDateTime.now()));
    }

    // ==================== ROLE EVENTS ====================

    public void publishRoleAssigned(RoleAssignedEvent event) {
        publishEvent(KafkaTopics.ROLE_ASSIGNED, event.getUserId(), event);
    }

    public void publishRoleRevoked(String userId, String roleName, String revokedBy) {
        publishEvent(KafkaTopics.ROLE_REVOKED, userId,
                java.util.Map.of(
                        "userId", userId,
                        "roleName", roleName,
                        "revokedBy", revokedBy,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    // ==================== PERMISSION EVENTS ====================

    public void publishPermissionGranted(String userId, String permissionName, String grantedBy) {
        publishEvent(KafkaTopics.PERMISSION_GRANTED, userId,
                java.util.Map.of(
                        "userId", userId,
                        "permissionName", permissionName,
                        "grantedBy", grantedBy,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    public void publishPermissionRevoked(String userId, String permissionName, String revokedBy) {
        publishEvent(KafkaTopics.PERMISSION_REVOKED, userId,
                java.util.Map.of(
                        "userId", userId,
                        "permissionName", permissionName,
                        "revokedBy", revokedBy,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    // ==================== EMAIL EVENTS ====================

    public void publishEmailVerificationSent(String userId, String email) {
        publishEvent(KafkaTopics.EMAIL_VERIFICATION_SENT, userId,
                java.util.Map.of(
                        "userId", userId,
                        "email", email,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    public void publishEmailVerified(String userId, String email) {
        publishEvent(KafkaTopics.EMAIL_VERIFIED, userId,
                java.util.Map.of(
                        "userId", userId,
                        "email", email,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    // ==================== SECURITY EVENTS ====================

    public void publishSecurityBreachDetected(String userId, String breachType, String details) {
        publishEvent(KafkaTopics.SECURITY_BREACH_DETECTED, userId,
                java.util.Map.of(
                        "userId", userId,
                        "breachType", breachType,
                        "details", details,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    public void publishSuspiciousActivity(String userId, String activityType, String ipAddress) {
        publishEvent(KafkaTopics.SUSPICIOUS_ACTIVITY, userId,
                java.util.Map.of(
                        "userId", userId,
                        "activityType", activityType,
                        "ipAddress", ipAddress,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    public void publishRateLimitExceeded(String identifier, String endpoint, String ipAddress) {
        publishEvent(KafkaTopics.RATE_LIMIT_EXCEEDED, identifier,
                java.util.Map.of(
                        "identifier", identifier,
                        "endpoint", endpoint,
                        "ipAddress", ipAddress,
                        "timestamp", java.time.LocalDateTime.now()
                ));
    }

    // ==================== HELPER METHOD ====================

    private void publishEvent(String topic, String key, Object event) {
        try {
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, event);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Published event to topic [{}] with key [{}]: offset={}",
                            topic, key, result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to publish event to topic [{}] with key [{}]", topic, key, ex);
                }
            });

        } catch (Exception e) {
            log.error("Error publishing event to topic [{}]", topic, e);
        }
    }
}
