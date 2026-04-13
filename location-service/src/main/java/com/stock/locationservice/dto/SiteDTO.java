package com.stock.locationservice.dto;

import com.stock.locationservice.entity.SiteType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteDTO {

    private String id;
    private String name;
    private SiteType type;
    private String timezone;
    private String address;
    private String settings;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
