package com.stock.productservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_variants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"sku"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "parent_item_id", nullable = false)
    private String parentItemId;

    @Column(unique = true, nullable = false, length = 50)
    private String sku;

    // Variant-specific attributes stored as JSON
    // Example: {"size": "L", "color": "Blue"} - these override/extend parent item attributes
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "variant_attributes", columnDefinition = "jsonb")
    private String variantAttributes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Optional: JPA relationship to parent item
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_item_id", insertable = false, updatable = false)
    private Item parentItem;
}
