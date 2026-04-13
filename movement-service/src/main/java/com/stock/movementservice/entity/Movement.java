package com.stock.movementservice.entity;
import com.stock.movementservice.entity.enums.MovementPriority;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "movements", indexes = {
        @Index(name = "idx_movement_status_type", columnList = "status, type"),
        @Index(name = "idx_movement_warehouse", columnList = "warehouse_id, status"),
        @Index(name = "idx_movement_date", columnList = "movement_date"),
        @Index(name = "idx_movement_locations", columnList = "source_location_id, destination_location_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movement {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Basic Information
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private MovementType type;

    @Column(name = "movement_date", nullable = false)
    private LocalDateTime movementDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MovementStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    @Builder.Default
    private MovementPriority priority = MovementPriority.NORMAL;

    // Dates
    @Column(name = "expected_date")
    private LocalDateTime expectedDate;

    @Column(name = "actual_date")
    private LocalDateTime actualDate;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    // References (UUID references to other microservices)
    @Column(name = "source_location_id")
    private UUID sourceLocationId;

    @Column(name = "destination_location_id")
    private UUID destinationLocationId;

    @Column(name = "source_user_id")
    private UUID sourceUserId;

    @Column(name = "destination_user_id")
    private UUID destinationUserId;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    // Documentation
    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reason", length = 500)
    private String reason;

    // Tracking
    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Relationships
    @OneToMany(mappedBy = "movement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MovementLine> lines = new ArrayList<>();

    @OneToMany(mappedBy = "movement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MovementTask> tasks = new ArrayList<>();

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (movementDate == null) {
            movementDate = LocalDateTime.now();
        }
        if (status == null) {
            status = MovementStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for managing relationships
    public void addLine(MovementLine line) {
        lines.add(line);
        line.setMovement(this);
    }

    public void removeLine(MovementLine line) {
        lines.remove(line);
        line.setMovement(null);
    }

    public void addTask(MovementTask task) {
        tasks.add(task);
        task.setMovement(this);
    }

    public void removeTask(MovementTask task) {
        tasks.remove(task);
        task.setMovement(null);
    }
}
