package com.stock.locationservice.dto;


import com.stock.locationservice.entity.SiteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteCreateRequest {

    @NotBlank(message = "Site name is required")
    private String name;

    @NotNull(message = "Site type is required")
    private SiteType type;

    private String timezone;
    private String address;
    private String settings;
}
