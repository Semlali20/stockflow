package com.stock.qualityservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "inspection_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionResult {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quality_control_id", nullable = false)
    private QualityControl qualityControl;

    @Column(name = "test_parameter", nullable = false)
    private String testParameter;

    @Column(name = "expected_value")
    private String expectedValue;

    @Column(name = "actual_value")
    private String actualValue;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "min_value")
    private Double minValue;

    @Column(name = "max_value")
    private Double maxValue;

    @Column(name = "is_passed", nullable = false)
    private Boolean isPassed;

    @Column(name = "defect_type")
    private String defectType;

    @Column(name = "defect_severity")
    private String defectSeverity; // CRITICAL, MAJOR, MINOR

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "sequence_order")
    private Integer sequenceOrder;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}