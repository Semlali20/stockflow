package com.stock.movementservice.dto.mapper;

import com.stock.movementservice.dto.request.MovementLineRequestDto;
import com.stock.movementservice.dto.response.MovementLineResponseDto;
import com.stock.movementservice.entity.MovementLine;
import org.springframework.stereotype.Component;

@Component
public class MovementLineMapper {

    public MovementLine toEntity(MovementLineRequestDto dto) {
        if (dto == null) {
            return null;
        }

        return MovementLine.builder()
                .itemId(dto.getItemId())
                .requestedQuantity(dto.getRequestedQuantity())
                .actualQuantity(dto.getActualQuantity())
                .uom(dto.getUom())
                .lotId(dto.getLotId())
                .serialId(dto.getSerialId())
                .fromLocationId(dto.getFromLocationId())
                .toLocationId(dto.getToLocationId())
                .status(dto.getStatus())
                .lineNumber(dto.getLineNumber())
                .notes(dto.getNotes())
                .reason(dto.getReason())
                .build();
    }

    public MovementLineResponseDto toResponseDto(MovementLine entity) {
        if (entity == null) {
            return null;
        }

        Double variance = null;
        if (entity.getActualQuantity() != null && entity.getRequestedQuantity() != null) {
            variance = entity.getActualQuantity() - entity.getRequestedQuantity();
        }

        return MovementLineResponseDto.builder()
                .id(entity.getId())
                .movementId(entity.getMovement() != null ? entity.getMovement().getId() : null)
                .itemId(entity.getItemId())
                .requestedQuantity(entity.getRequestedQuantity())
                .actualQuantity(entity.getActualQuantity())
                .uom(entity.getUom())
                .lotId(entity.getLotId())
                .serialId(entity.getSerialId())
                .fromLocationId(entity.getFromLocationId())
                .toLocationId(entity.getToLocationId())
                .status(entity.getStatus())
                .lineNumber(entity.getLineNumber())
                .notes(entity.getNotes())
                .reason(entity.getReason())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .varianceQuantity(variance)
                .build();
    }
}
