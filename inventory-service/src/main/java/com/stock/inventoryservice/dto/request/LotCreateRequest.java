// inventory-service/src/main/java/com/stock/inventoryservice/dto/request/LotCreateRequest.java
package com.stock.inventoryservice.dto.request;

import com.stock.inventoryservice.entity.LotStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LotCreateRequest {

    @NotBlank(message = "Code is required")
    @Size(max = 100, message = "Code must be 100 characters or less")
    private String code;

    @NotBlank(message = "Item ID is required")
    private String itemId;

    @NotBlank(message = "Lot number is required")
    @Size(max = 100, message = "Lot number must be 100 characters or less")
    private String lotNumber;

    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;

    @Past(message = "Manufacture date must be in the past")
    private LocalDate manufactureDate;

    private String supplierId;

    @NotNull(message = "Status is required")
    private LotStatus status;

    private String attributes; // JSON string
}
