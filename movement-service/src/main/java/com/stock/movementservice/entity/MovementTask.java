package com.stock.movementservice.entity;

import com.stock.movementservice.entity.enums.TaskStatus;
import com.stock.movementservice.entity.enums.TaskType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "movement_tasks", indexes = {
        @Index(name = "idx_task_movement", columnList = "movement_id"),
        @Index(name = "idx_task_user", columnList = "assigned_user_id, status"),
        @Index(name = "idx_task_scheduled", columnList = "scheduled_start_time"),
        @Index(name = "idx_task_location", columnList = "location_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementTask {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Foreign Keys
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movement_id", nullable = false)
    @ToString.Exclude
    private Movement movement;

    @Column(name = "movement_line_id")
    private UUID movementLineId;

    @Column(name = "assigned_user_id")
    private UUID assignedUserId;

    // Task Details
    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 50)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 5;

    // Timing
    @Column(name = "scheduled_start_time")
    private LocalDateTime scheduledStartTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "expected_completion_time")
    private LocalDateTime expectedCompletionTime;

    @Column(name = "actual_completion_time")
    private LocalDateTime actualCompletionTime;

    // Location
    @Column(name = "location_id")
    private UUID locationId;

    // Documentation
    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Audit
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = TaskStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
