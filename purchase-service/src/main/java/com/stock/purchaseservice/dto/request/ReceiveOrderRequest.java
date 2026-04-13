package com.stock.purchaseservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiveOrderRequest {

    @NotEmpty(message = "At least one received line is required")
    @Valid
    private List<ReceivedLineRequest> lines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReceivedLineRequest {

        @NotNull(message = "Line ID is required")
        private UUID lineId;

        @NotNull(message = "Received quantity is required")
        @Min(value = 1, message = "Received quantity must be at least 1")
        private Integer receivedQuantity;
    }
}
