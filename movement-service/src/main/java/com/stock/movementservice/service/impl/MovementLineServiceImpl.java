package com.stock.movementservice.service.impl;

import com.stock.movementservice.dto.mapper.MovementLineMapper;
import com.stock.movementservice.dto.request.MovementLineRequestDto;
import com.stock.movementservice.dto.response.MovementLineResponseDto;
import com.stock.movementservice.entity.Movement;
import com.stock.movementservice.entity.MovementLine;
import com.stock.movementservice.entity.enums.LineStatus;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.exception.InvalidMovementStateException;
import com.stock.movementservice.exception.MovementLineNotFoundException;
import com.stock.movementservice.exception.MovementNotFoundException;
import com.stock.movementservice.repository.MovementLineRepository;
import com.stock.movementservice.repository.MovementRepository;
import com.stock.movementservice.service.MovementLineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MovementLineServiceImpl implements MovementLineService {

    private final MovementLineRepository lineRepository;
    private final MovementRepository movementRepository;
    private final MovementLineMapper lineMapper;

    @Override
    @Transactional(readOnly = true)
    public MovementLineResponseDto getLineById(UUID id) {
        log.info("Fetching movement line with ID: {}", id);

        MovementLine line = lineRepository.findById(id)
                .orElseThrow(() -> new MovementLineNotFoundException(id));

        return lineMapper.toResponseDto(line);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementLineResponseDto> getLinesByMovement(UUID movementId) {
        log.info("Fetching lines for movement: {}", movementId);

        List<MovementLine> lines = lineRepository.findByMovement_Id(movementId);

        return lines.stream()
                .map(lineMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementLineResponseDto> getLinesByItem(UUID itemId) {
        log.info("Fetching lines for item: {}", itemId);

        List<MovementLine> lines = lineRepository.findByItemId(itemId);

        return lines.stream()
                .map(lineMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementLineResponseDto> getLinesByStatus(LineStatus status) {
        log.info("Fetching lines with status: {}", status);

        List<MovementLine> lines = lineRepository.findByStatus(status);

        return lines.stream()
                .map(lineMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public MovementLineResponseDto addLineToMovement(UUID movementId, MovementLineRequestDto requestDto, UUID userId) {
        log.info("Adding line to movement: {}", movementId);

        Movement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new MovementNotFoundException(movementId));

        // Cannot add lines to completed or cancelled movements
        if (movement.getStatus() == MovementStatus.COMPLETED ||
                movement.getStatus() == MovementStatus.CANCELLED) {
            throw new InvalidMovementStateException(movementId, movement.getStatus(), "add line");
        }

        MovementLine line = lineMapper.toEntity(requestDto);
        movement.addLine(line);

        movementRepository.save(movement);

        log.info("Line added successfully to movement: {}", movementId);

        return lineMapper.toResponseDto(line);
    }

    @Override
    public MovementLineResponseDto updateLine(UUID id, MovementLineRequestDto requestDto, UUID userId) {
        log.info("Updating movement line: {}", id);

        MovementLine line = lineRepository.findById(id)
                .orElseThrow(() -> new MovementLineNotFoundException(id));

        // Update fields
        if (requestDto.getRequestedQuantity() != null) {
            line.setRequestedQuantity(requestDto.getRequestedQuantity());
        }

        if (requestDto.getActualQuantity() != null) {
            line.setActualQuantity(requestDto.getActualQuantity());
        }

        if (requestDto.getUom() != null) {
            line.setUom(requestDto.getUom());
        }

        if (requestDto.getLotId() != null) {
            line.setLotId(requestDto.getLotId());
        }

        if (requestDto.getSerialId() != null) {
            line.setSerialId(requestDto.getSerialId());
        }

        if (requestDto.getFromLocationId() != null) {
            line.setFromLocationId(requestDto.getFromLocationId());
        }

        if (requestDto.getToLocationId() != null) {
            line.setToLocationId(requestDto.getToLocationId());
        }

        if (requestDto.getStatus() != null) {
            line.setStatus(requestDto.getStatus());
        }

        if (requestDto.getNotes() != null) {
            line.setNotes(requestDto.getNotes());
        }

        if (requestDto.getReason() != null) {
            line.setReason(requestDto.getReason());
        }

        MovementLine updatedLine = lineRepository.save(line);

        log.info("Movement line updated successfully: {}", id);

        return lineMapper.toResponseDto(updatedLine);
    }

    @Override
    public void deleteLine(UUID id, UUID userId) {
        log.info("Deleting movement line: {}", id);

        MovementLine line = lineRepository.findById(id)
                .orElseThrow(() -> new MovementLineNotFoundException(id));

        // Cannot delete lines from completed movements
        if (line.getMovement().getStatus() == MovementStatus.COMPLETED) {
            throw new InvalidMovementStateException(
                    line.getMovement().getId(),
                    line.getMovement().getStatus(),
                    "delete line"
            );
        }

        lineRepository.delete(line);

        log.info("Movement line deleted successfully: {}", id);
    }

    @Override
    public MovementLineResponseDto updateActualQuantity(UUID id, Double actualQuantity, UUID userId) {
        log.info("Updating actual quantity for line: {} to {}", id, actualQuantity);

        MovementLine line = lineRepository.findById(id)
                .orElseThrow(() -> new MovementLineNotFoundException(id));

        line.setActualQuantity(actualQuantity);

        MovementLine updatedLine = lineRepository.save(line);

        log.info("Actual quantity updated successfully for line: {}", id);

        return lineMapper.toResponseDto(updatedLine);
    }

    @Override
    public MovementLineResponseDto completeLine(UUID id, UUID userId) {
        log.info("Completing movement line: {}", id);

        MovementLine line = lineRepository.findById(id)
                .orElseThrow(() -> new MovementLineNotFoundException(id));

        line.setStatus(LineStatus.COMPLETED);

        MovementLine updatedLine = lineRepository.save(line);

        log.info("Movement line completed successfully: {}", id);

        return lineMapper.toResponseDto(updatedLine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementLineResponseDto> getLinesWithVariance() {
        log.info("Fetching lines with variance");

        List<MovementLine> lines = lineRepository.findLinesWithVariance();

        return lines.stream()
                .map(lineMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementLineResponseDto> getShortPickedLines() {
        log.info("Fetching short picked lines");

        List<MovementLine> lines = lineRepository.findShortPickedLines();

        return lines.stream()
                .map(lineMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
