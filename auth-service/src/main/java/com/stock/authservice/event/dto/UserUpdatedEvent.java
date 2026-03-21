package com.stock.authservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdatedEvent {

    private String userId;
    private String username;
    private Map<String, Object> changedFields; // field name -> new value
    private String updatedBy;
    private LocalDateTime updatedAt;
}
