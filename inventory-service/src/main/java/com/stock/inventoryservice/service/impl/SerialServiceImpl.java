package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.dto.*;
import com.stock.inventoryservice.dto.request.SerialCreateRequest;
import com.stock.inventoryservice.dto.request.SerialUpdateRequest;
import com.stock.inventoryservice.entity.Serial;
import com.stock.inventoryservice.entity.SerialStatus;
import com.stock.inventoryservice.event.dto.SerialEvent;
import com.stock.inventoryservice.exception.DuplicateResourceException;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import com.stock.inventoryservice.repository.SerialRepository;
import com.stock.inventoryservice.service.SerialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SerialServiceImpl implements SerialService {

    private final SerialRepository serialRepository;
    private final SerialEventPublisher eventPublisher;

    @Override
    public SerialDTO createSerial(SerialCreateRequest request) {
        log.info("Creating serial with code: {}", request.getCode());

        // Check for duplicate code
        if (serialRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Serial with code " + request.getCode() + " already exists");
        }

        // Check for duplicate serial number
        if (serialRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new DuplicateResourceException("Serial number " + request.getSerialNumber() + " already exists");
        }

        Serial serial = Serial.builder()
                .code(request.getCode())
                .itemId(request.getItemId())
                .serialNumber(request.getSerialNumber())
                .locationId(request.getLocationId())
                .status(request.getStatus() != null ? request.getStatus() : SerialStatus.IN_STOCK)
                .build();

        Serial savedSerial = serialRepository.save(serial);
        log.info("Serial created successfully with ID: {}", savedSerial.getId());

        // Publish event
        publishSerialEvent(savedSerial, "CREATED");

        return mapToDTO(savedSerial);
    }

    @Override
    @Transactional(readOnly = true)
    public SerialDTO getSerialById(String id) {
        log.debug("Fetching serial with ID: {}", id);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        return mapToDTO(serial);
    }

    @Override
    @Transactional(readOnly = true)
    public SerialDTO getSerialByCode(String code) {
        log.debug("Fetching serial with code: {}", code);

        Serial serial = serialRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with code: " + code));

        return mapToDTO(serial);
    }

    @Override
    @Transactional(readOnly = true)
    public SerialDTO getSerialBySerialNumber(String serialNumber) {
        log.debug("Fetching serial with serial number: {}", serialNumber);

        Serial serial = serialRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with serial number: " + serialNumber));

        return mapToDTO(serial);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getAllSerials() {
        log.debug("Fetching all serials");

        return serialRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByItemId(String itemId) {
        log.debug("Fetching serials for item ID: {}", itemId);

        return serialRepository.findByItemId(itemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByLotId(String lotId) {
        log.debug("Fetching serials for lot ID: {}", lotId);

        return serialRepository.findByLotId(lotId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByLocationId(String locationId) {
        log.debug("Fetching serials for location ID: {}", locationId);

        return serialRepository.findByLocationId(locationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByStatus(String status) {
        log.debug("Fetching serials with status: {}", status);

        SerialStatus serialStatus = SerialStatus.valueOf(status.toUpperCase());
        return serialRepository.findByStatus(serialStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByItemIdAndStatus(String itemId, String status) {
        log.debug("Fetching serials for item: {} with status: {}", itemId, status);

        SerialStatus serialStatus = SerialStatus.valueOf(status.toUpperCase());
        return serialRepository.findByItemIdAndStatus(itemId, serialStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getAvailableSerials(String itemId) {
        log.debug("Fetching available serials for item: {}", itemId);

        return serialRepository.findByItemIdAndStatus(itemId, SerialStatus.IN_STOCK).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SerialDTO updateSerial(String id, SerialUpdateRequest request) {
        log.info("Updating serial with ID: {}", id);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        // Update fields
        if (request.getSerialNumber() != null) {
            // Check for duplicate
            if (!serial.getSerialNumber().equals(request.getSerialNumber()) &&
                    serialRepository.existsBySerialNumber(request.getSerialNumber())) {
                throw new DuplicateResourceException("Serial number " + request.getSerialNumber() + " already exists");
            }
            serial.setSerialNumber(request.getSerialNumber());
        }
        if (request.getLocationId() != null) {
            serial.setLocationId(request.getLocationId());
        }
        if (request.getStatus() != null) {
            serial.setStatus(request.getStatus());
        }

        Serial savedSerial = serialRepository.save(serial);
        log.info("Serial updated successfully");

        // Publish event
        publishSerialEvent(savedSerial, "UPDATED");

        return mapToDTO(savedSerial);
    }

    @Override
    public SerialDTO updateSerialStatus(String id, String status) {
        log.info("Updating serial status for ID: {} to {}", id, status);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        SerialStatus serialStatus = SerialStatus.valueOf(status.toUpperCase());
        serial.setStatus(serialStatus);

        Serial savedSerial = serialRepository.save(serial);
        log.info("Serial status updated successfully");

        // Publish event
        publishSerialEvent(savedSerial, "STATUS_CHANGED");

        return mapToDTO(savedSerial);
    }

    @Override
    public SerialDTO updateSerialLocation(String id, String locationId) {
        log.info("Updating serial location for ID: {} to location: {}", id, locationId);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        serial.setLocationId(locationId);

        Serial savedSerial = serialRepository.save(serial);
        log.info("Serial location updated successfully");

        // Publish event
        publishSerialEvent(savedSerial, "LOCATION_CHANGED");

        return mapToDTO(savedSerial);
    }

    @Override
    public void deleteSerial(String id) {
        log.info("Deleting serial with ID: {}", id);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        serialRepository.delete(serial);
        log.info("Serial deleted successfully");

        // Publish event
        publishSerialEvent(serial, "DELETED");
    }

    @Override
    @Transactional(readOnly = true)
    public Long countSerialsByLot(String lotId) {
        log.debug("Counting serials for lot: {}", lotId);
        return serialRepository.countByLotId(lotId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countSerialsByItem(String itemId) {
        log.debug("Counting serials for item: {}", itemId);
        return serialRepository.countByItemId(itemId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSerialAvailable(String serialNumber) {
        log.debug("Checking availability of serial: {}", serialNumber);

        return serialRepository.findBySerialNumber(serialNumber)
                .map(serial -> serial.getStatus() == SerialStatus.IN_STOCK)
                .orElse(false);
    }

    // ========== HELPER METHODS ==========

    private void publishSerialEvent(Serial serial, String eventType) {
        SerialEvent event = SerialEvent.builder()
                .serialId(serial.getId())
                .serialCode(serial.getCode())
                .itemId(serial.getItemId())
                .serialNumber(serial.getSerialNumber())
                .lotId(null) // Serial entity doesn't have lotId
                .locationId(serial.getLocationId())
                .status(serial.getStatus().name())
                .eventType(eventType)
                .timestamp(LocalDateTime.now())
                .build();

        eventPublisher.publishSerialEvent(event);
    }

    private SerialDTO mapToDTO(Serial serial) {
        return SerialDTO.builder()
                .id(serial.getId())
                .code(serial.getCode())
                .itemId(serial.getItemId())
                .serialNumber(serial.getSerialNumber())
                .status(serial.getStatus())
                .locationId(serial.getLocationId())
                .createdAt(serial.getCreatedAt())
                .updatedAt(serial.getUpdatedAt())
                .build();
    }
}
