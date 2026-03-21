package com.stock.qualityservice.event.incoming;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreatedEvent {

    private String eventId;
    private String eventType; // CATEGORY_CREATED
    private LocalDateTime eventTime;

    private String categoryId;
    private String name;
    private String description;
    private String parentCategoryId;
    private Boolean isActive;
}