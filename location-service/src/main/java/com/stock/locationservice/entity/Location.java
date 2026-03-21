package com.stock.locationservice.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "locations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_id", "code"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Version
    private Long version;
    @Column(name = "warehouse_id", nullable = false)
    private String warehouseId;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(length = 50)
    private String zone;

    @Column(length = 50)
    private String aisle;

    @Column(length = 50)
    private String rack;

    @Column(length = 50)
    private String level;

    @Column(length = 50)
    private String bin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LocationType type;

    @Column
    private String capacity;


    @Column
     private String restrictions;


    @Column
    private String coordinates;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relation avec Warehouse (optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    private Warehouse warehouse;
}
