// inventory-service/src/main/java/com/stock/inventoryservice/entity/Lot.java
package com.stock.inventoryservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lots", indexes = {
        @Index(name = "idx_lot_item", columnList = "item_id"),
        @Index(name = "idx_lot_number", columnList = "lot_number"),
        @Index(name = "idx_lot_expiry", columnList = "expiry_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    // Cross-service reference
    @Column(name = "item_id", nullable = false, length = 36)
    private String itemId; // → Product Service

    @Column(name = "lot_number", nullable = false, length = 100)
    private String lotNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Column(name = "supplier_id", length = 36)
    private String supplierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LotStatus status;

    @Column(columnDefinition = "TEXT")
    private String attributes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


}
