package com.stock.qualityservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "sampling_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SamplingPlan {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "sampling_type", nullable = false)
    private SamplingType samplingType;

    @Column(name = "inspection_level")
    private String inspectionLevel; // I, II, III (ANSI/ASQ Z1.4)

    @Column(name = "aql_percentage")
    private Double aqlPercentage; // Acceptable Quality Limit

    @Column(name = "lot_size_min")
    private Integer lotSizeMin;

    @Column(name = "lot_size_max")
    private Integer lotSizeMax;

    @Column(name = "sample_size")
    private Integer sampleSize;

    @Column(name = "sample_percentage")
    private Double samplePercentage;

    @Column(name = "accept_number")
    private Integer acceptNumber;

    @Column(name = "reject_number")
    private Integer rejectNumber;

    @Column(name = "second_sample_size")
    private Integer secondSampleSize; // For double sampling

    @Column(name = "second_accept_number")
    private Integer secondAcceptNumber;

    @Column(name = "second_reject_number")
    private Integer secondRejectNumber;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_default")
    private Boolean isDefault = false;

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