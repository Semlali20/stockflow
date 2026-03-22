package com.stock.purchaseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_lines", indexes = {
        @Index(name = "idx_pol_order", columnList = "purchase_order_id"),
        @Index(name = "idx_pol_item", columnList = "item_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderLine {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @ToString.Exclude
    private PurchaseOrder purchaseOrder;

    @Column(name = "item_id", length = 36)
    private String itemId;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "item_sku", length = 100)
    private String itemSku;

    @Column(name = "ordered_quantity", nullable = false)
    private Integer orderedQuantity;

    @Column(name = "received_quantity")
    @Builder.Default
    private Integer receivedQuantity = 0;

    @Column(name = "unit_price", precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 19, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Compute total price from unit price * ordered quantity
     */
    @PrePersist
    @PreUpdate
    protected void computeTotalPrice() {
        if (unitPrice != null && orderedQuantity != null) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(orderedQuantity));
        }
    }
}
