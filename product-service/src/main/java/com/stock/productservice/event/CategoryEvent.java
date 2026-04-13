package com.stock.productservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryEvent {
    private String id;
    private String name;
    private String parentId;
    private Boolean isActive;
    private LocalDateTime timestamp;
    private String eventType; // CREATED, UPDATED, DELETED
}