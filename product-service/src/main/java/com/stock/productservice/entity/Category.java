package com.stock.productservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "parent_category_id")
    private String parentCategoryId;

    @Column(name = "display_order")
    private Integer displayOrder;

    // Attribute schemas stored as JSON (defines what attributes items in this category can have)
    // Example: {"attributeSchemas": [{"name": "color", "type": "string", "required": true}]}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attribute_schemas", columnDefinition = "jsonb")
    private String attributeSchemas;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id", insertable = false, updatable = false)
    private Category parentCategory;
}