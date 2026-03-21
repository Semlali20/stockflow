// inventory-service/src/main/java/com/stock/inventoryservice/entity/Serial.java
package com.stock.inventoryservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "serials", indexes = {
        @Index(name = "idx_serial_item", columnList = "item_id"),
        @Index(name = "idx_serial_number", columnList = "serial_number")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Serial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    // Cross-service reference
    @Column(name = "item_id", nullable = false, length = 36)
    private String itemId; // → Product Service

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SerialStatus status;

    // Cross-service reference
    @Column(name = "location_id", length = 36)
    private String locationId; // → Location Service

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


}
