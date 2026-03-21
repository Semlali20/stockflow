package com.stock.qualityservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "quarantine")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quarantine {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "quarantine_number", unique = true, nullable = false)
    private String quarantineNumber;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "lot_id")
    private String lotId;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "location_id")
    private String locationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QuarantineStatus status;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "inspector_id")
    private String inspectorId;

    @Column(name = "quality_profile_id")
    private String qualityProfileId;

    @Column(name = "entry_date", nullable = false)
    private LocalDateTime entryDate;

    @Column(name = "expected_release_date")
    private LocalDateTime expectedReleaseDate;

    @Column(name = "actual_release_date")
    private LocalDateTime actualReleaseDate;

    @Column(name = "release_notes")
    private String releaseNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "disposition")
    private Disposition disposition;

    @Column(name = "severity", nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "quarantine_type", nullable = false)
    private String quarantineType; // MANUAL, AUTOMATIC, RULE_BASED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "related_inspection_id")
    private String relatedInspectionId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        entryDate = LocalDateTime.now();
        if (status == null) {
            status = QuarantineStatus.IN_PROCESS;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}