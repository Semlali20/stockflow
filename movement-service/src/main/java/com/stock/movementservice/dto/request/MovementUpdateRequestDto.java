package com.stock.movementservice.dto.request;

import com.stock.movementservice.entity.enums.MovementPriority;
import com.stock.movementservice.entity.enums.MovementStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementUpdateRequestDto {

    private MovementStatus status;

    private MovementPriority priority;

    private LocalDateTime expectedDate;

    private LocalDateTime actualDate;

    private LocalDateTime scheduledDate;

    private UUID sourceLocationId;

    private UUID destinationLocationId;

    private UUID sourceUserId;

    private UUID destinationUserId;

    @Size(max = 100, message = "Reference number must not exceed 100 characters")
    private String referenceNumber;

    @Size(max = 5000, message = "Notes must not exceed 5000 characters")
    private String notes;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
