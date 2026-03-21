package com.stock.locationservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseDTO {

    private String id;
    private String siteId;
    private String siteName;  // Pour affichage
    private String name;
    private String code;
    private String settings;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
