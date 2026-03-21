// inventory-service/src/main/java/com/stock/inventoryservice/entity/Inventory.java
package com.stock.inventoryservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", indexes = {
        @Index(name = "idx_item_id", columnList = "item_id"),
        @Index(name = "idx_location_id", columnList = "location_id"),
        @Index(name = "idx_item_location", columnList = "item_id, location_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Version
    private Long version;

    // ===== CROSS-SERVICE REFERENCES (String IDs ONLY) =====

    @Column(name = "item_id", nullable = false, length = 36)
    private String itemId; // → Product Service

    @Column(name = "warehouse_id", nullable = false, length = 36)
    private String warehouseId; // → Location Service

    @Column(name = "location_id", nullable = false, length = 36)
    private String locationId; // → Location Service

    // ===== SAME-SERVICE REFERENCES =====

    @Column(name = "lot_id", length = 36)
    private String lotId; // → Lot table (same service)

    @Column(name = "serial_id", length = 36)
    private String serialId; // → Serial table (same service)

    // ===== QUANTITIES =====

    @Column(name = "quantity_on_hand", nullable = false)
    private Double quantityOnHand = 0.0;

    @Column(name = "quantity_reserved", nullable = false)
    private Double quantityReserved = 0.0;

    @Column(name = "quantity_damaged")
    private Double quantityDamaged = 0.0;

    @Column(length = 20)
    private String uom;

    // ===== METADATA =====

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InventoryStatus status;

    @Column(precision = 19, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Column(name = "last_count_date")
    private LocalDate lastCountDate;

    @Column(columnDefinition = "TEXT")
    private String attributes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== JPA RELATIONSHIPS (ONLY within same service) =====

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id", insertable = false, updatable = false)
    private Lot lot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id", insertable = false, updatable = false)
    private Serial serial;

    // ===== CALCULATED FIELDS =====

    @Transient
    public Double getAvailableQuantity() {
        return quantityOnHand - quantityReserved;
    }
}
