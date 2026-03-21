package com.stock.authservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs",
        indexes = {
                @Index(name = "idx_user_id", columnList = "user_id"),
                @Index(name = "idx_action", columnList = "action"),
                @Index(name = "idx_timestamp", columnList = "timestamp")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "resource_type", length = 100)
    private String resourceType;

    @Column(name = "resource_id", length = 100)
    private String resourceId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "details", columnDefinition = "text")
    private String details;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // Helper factory methods
    public static AuditLog success(String userId, String username, String action, String ipAddress) {
        return AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .ipAddress(ipAddress)
                .status("SUCCESS")
                .build();
    }

    public static AuditLog failure(String userId, String username, String action, String ipAddress, String error) {
        return AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .ipAddress(ipAddress)
                .status("FAILURE")
                .errorMessage(error)
                .build();
    }
}
