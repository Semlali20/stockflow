package com.stock.qualityservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 📏 Revelation Entity
 * Defines quality testing standards and acceptance criteria for inspections
 */
@Entity
@Table(name = "revelations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Revelation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "quality_profile_id")
    private UUID qualityProfileId;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_type", nullable = false)
    private TestType testType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String parameter; // What to test (e.g., "Length", "Weight", "Color")

    @Column(name = "test_parameter", nullable = false)
    private String testParameter; // Alias for parameter

    @Column(name = "acceptable_min")
    private Double acceptableMin;

    @Column(name = "acceptable_max")
    private Double acceptableMax;

    @Column(length = 50)
    private String unit; // Unit of measurement (e.g., "mm", "kg", "pcs")

    @Column(name = "is_mandatory")
    private Boolean isMandatory = false; // Must pass for overall approval

    @Column(columnDefinition = "TEXT")
    private String instructions; // Testing instructions for inspectors

    @Column(name = "test_instructions", columnDefinition = "TEXT")
    private String testInstructions;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
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

    /**
     * Test Type Enum
     */
    public enum TestType {
        VISUAL,          // Visual inspection (color, appearance, defects)
        DIMENSIONAL,     // Measurements (length, width, height, weight)
        FUNCTIONAL,      // Functional testing (does it work?)
        CHEMICAL,        // Chemical analysis
        MECHANICAL,      // Mechanical properties (strength, hardness)
        ELECTRICAL,      // Electrical testing
        ENVIRONMENTAL    // Environmental testing (temperature, humidity)
    }
}
