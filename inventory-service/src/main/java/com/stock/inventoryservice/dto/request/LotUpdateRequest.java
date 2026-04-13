package com.stock.inventoryservice.dto.request;

import com.stock.inventoryservice.entity.LotStatus;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LotUpdateRequest {

    @Size(max = 100, message = "Lot number must be 100 characters or less")
    private String lotNumber;

    private LocalDate expiryDate;

    @Past(message = "Manufacture date must be in the past")
    private LocalDate manufactureDate;

    private String supplierId;

    private LotStatus status;

    private String attributes; // JSON string for custom fields
}
