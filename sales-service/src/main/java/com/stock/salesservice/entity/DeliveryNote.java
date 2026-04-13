package com.stock.salesservice.entity;

import com.stock.salesservice.enums.DeliveryNoteStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "delivery_notes", indexes = {
        @Index(name = "idx_delivery_note_status", columnList = "status"),
        @Index(name = "idx_delivery_note_customer", columnList = "customer_id"),
        @Index(name = "idx_delivery_note_reference", columnList = "reference"),
        @Index(name = "idx_delivery_note_quote", columnList = "quote_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "reference", unique = true, length = 50)
    private String reference;

    @Column(name = "quote_id", length = 100)
    private String quoteId;

    @Column(name = "customer_id", length = 100)
    private String customerId;

    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private DeliveryNoteStatus status = DeliveryNoteStatus.DRAFT;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "total_amount", precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "inventory_id", length = 100)
    private String inventoryId;

    @Column(name = "location_id", length = 100)
    private String locationId;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "deliveryNote", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<DeliveryNoteLine> lines = new ArrayList<>();

    // Helper methods for managing relationships
    public void addLine(DeliveryNoteLine line) {
        lines.add(line);
        line.setDeliveryNote(this);
    }

    public void removeLine(DeliveryNoteLine line) {
        lines.remove(line);
        line.setDeliveryNote(null);
    }
}
