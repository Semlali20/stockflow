package com.stock.productservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"sku"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Version
    private Long version;

    @Column(name = "category_id", nullable = false)
    private String categoryId;

    @Column(unique = true, nullable = false, length = 50)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    // Flexible attributes stored as JSON (like {"color": "red", "size": "large"})
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String attributes;

    @Column(length = 500)
    private String tags;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_serialized", nullable = false)
    private Boolean isSerialized = false;

    @Column(name = "is_lot_managed", nullable = false)
    private Boolean isLotManaged = false;

    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;

    @Column(name = "hazardous_material", nullable = false)
    private Boolean hazardousMaterial = false;

    // Temperature control requirements stored as JSON array (like ["2-8°C", "DRY"])
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "temperature_control", columnDefinition = "jsonb")
    private String temperatureControl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Optional: JPA relationship for display purposes (like Location has warehouse relationship)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    // Helper method from diagram
    public Boolean isExpirable() {
        return shelfLifeDays != null && shelfLifeDays > 0;
    }
}