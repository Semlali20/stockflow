package com.stock.authservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreatedEvent {

    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
    private String createdBy;
    private LocalDateTime createdAt;
}
