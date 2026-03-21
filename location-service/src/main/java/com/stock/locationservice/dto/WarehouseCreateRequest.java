package com.stock.locationservice.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseCreateRequest {

    @NotBlank(message = "Site ID is required")
    private String siteId;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Warehouse code is required")
    private String code;

    private String settings;
}
