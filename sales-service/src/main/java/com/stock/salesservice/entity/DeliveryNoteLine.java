package com.stock.salesservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "delivery_note_lines", indexes = {
        @Index(name = "idx_delivery_line_note", columnList = "delivery_note_id"),
        @Index(name = "idx_delivery_line_item", columnList = "item_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryNoteLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_note_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private DeliveryNote deliveryNote;

    @Column(name = "item_id", length = 100)
    private String itemId;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "item_sku", length = 100)
    private String itemSku;

    @Column(name = "ordered_quantity")
    private Integer orderedQuantity;

    @Column(name = "delivered_quantity")
    @Builder.Default
    private Integer deliveredQuantity = 0;

    @Column(name = "lot_id", length = 100)
    private String lotId;

    @Column(name = "serial_id", length = 100)
    private String serialId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
