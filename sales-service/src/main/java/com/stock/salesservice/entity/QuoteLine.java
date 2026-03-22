package com.stock.salesservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "quote_lines", indexes = {
        @Index(name = "idx_quote_line_quote", columnList = "quote_id"),
        @Index(name = "idx_quote_line_item", columnList = "item_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Quote quote;

    @Column(name = "item_id", length = 100)
    private String itemId;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "item_sku", length = 100)
    private String itemSku;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price", precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "total_price", precision = 19, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
