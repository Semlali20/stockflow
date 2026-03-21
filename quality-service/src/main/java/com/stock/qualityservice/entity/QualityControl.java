package com.stock.qualityservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quality_controls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityControl {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "inspection_number", unique = true, nullable = false)
    private String inspectionNumber;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "lot_id")
    private String lotId;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "quantity_inspected", nullable = false)
    private Double quantityInspected;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", nullable = false)
    private QCType inspectionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QCStatus status;

    @Column(name = "quality_profile_id")
    private String qualityProfileId;

    @Column(name = "sampling_plan_id")
    private String samplingPlanId;

    @Column(name = "inspector_id", nullable = false)
    private String inspectorId;

    @Column(name = "inspected_by")
    private String inspectedBy;

    @Column(name = "inspection_location_id")
    private String inspectionLocationId;

    @Column(name = "location_id")
    private String locationId;

    @Column(name = "warehouse_id")
    private String warehouseId;

    @Column(name = "related_movement_id")
    private String relatedMovementId;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "disposition")
    private Disposition disposition;

    @Column(name = "passed_quantity")
    private Double passedQuantity;

    @Column(name = "failed_quantity")
    private Double failedQuantity;

    @Column(name = "defect_count")
    private Integer defectCount;

    @Column(name = "defect_type")
    private String defectType;

    @Column(name = "defect_rate")
    private Double defectRate;

    @Column(name = "inspector_notes", columnDefinition = "TEXT")
    private String inspectorNotes;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "corrective_action", columnDefinition = "TEXT")
    private String correctiveAction;

    @Column(name = "quarantine_id")
    private String quarantineId;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @OneToMany(mappedBy = "qualityControl", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InspectionResult> inspectionResults = new ArrayList<>();

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
        if (status == null) {
            status = QCStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}