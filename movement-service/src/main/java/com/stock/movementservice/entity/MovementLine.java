package com.stock.movementservice.entity;

import com.stock.movementservice.entity.enums.LineStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "movement_lines", indexes = {
        @Index(name = "idx_line_movement", columnList = "movement_id"),
        @Index(name = "idx_line_item", columnList = "item_id, status"),
        @Index(name = "idx_line_lot", columnList = "lot_id"),
        @Index(name = "idx_line_serial", columnList = "serial_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementLine {

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

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    // Quantities
    @Column(name = "requested_quantity", nullable = false)
    private Double requestedQuantity;

    @Column(name = "actual_quantity")
    private Double actualQuantity;

    @Column(name = "uom", length = 20)
    private String uom;

    // Tracking
    @Column(name = "lot_id")
    private UUID lotId;

    @Column(name = "serial_id")
    private UUID serialId;

    @Column(name = "from_location_id")
    private UUID fromLocationId;

    @Column(name = "to_location_id")
    private UUID toLocationId;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private LineStatus status = LineStatus.PENDING;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    // Documentation
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reason", length = 500)
    private String reason;

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
            status = LineStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
