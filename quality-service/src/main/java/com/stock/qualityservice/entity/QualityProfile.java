package com.stock.qualityservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "quality_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityProfile {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "item_id")
    private String itemId;

    @Column(name = "category_id")
    private String categoryId;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_type", nullable = false)
    private QualityProfileType profileType;

    @Column(name = "inspection_criteria", columnDefinition = "TEXT")
    private String inspectionCriteria; // JSON string

    @Column(name = "pass_threshold")
    private Double passThreshold;

    @Column(name = "fail_threshold")
    private Double failThreshold;

    @Column(name = "sampling_plan_id")
    private String samplingPlanId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "version")
    private Integer version = 1;

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}