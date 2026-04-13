package com.stock.inventoryservice.dto.request;

import com.stock.inventoryservice.entity.SerialStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerialUpdateRequest {

    @Size(max = 100, message = "Serial number must be 100 characters or less")
    private String serialNumber;

    private SerialStatus status;

    private String locationId;
}
