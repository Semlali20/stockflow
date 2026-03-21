package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.dto.*;
import com.stock.inventoryservice.dto.request.LotCreateRequest;
import com.stock.inventoryservice.dto.request.LotUpdateRequest;
import com.stock.inventoryservice.entity.Lot;
import com.stock.inventoryservice.entity.LotStatus;
import com.stock.inventoryservice.event.dto.LotEvent;
import com.stock.inventoryservice.exception.DuplicateResourceException;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import com.stock.inventoryservice.repository.LotRepository;
import com.stock.inventoryservice.service.LotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LotServiceImpl implements LotService {

    private final LotRepository lotRepository;
    private final LotEventPublisher eventPublisher;

    @Override
    public LotDTO createLot(LotCreateRequest request) {
        log.info("Creating lot with code: {}", request.getCode());

        // Check for duplicate code
        if (lotRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Lot with code " + request.getCode() + " already exists");
        }

        Lot lot = Lot.builder()
                .code(request.getCode())
                .itemId(request.getItemId())
                .lotNumber(request.getLotNumber())
                .expiryDate(request.getExpiryDate())
                .manufactureDate(request.getManufactureDate())
                .status(LotStatus.ACTIVE)
                .attributes(request.getAttributes())
                .build();

        Lot savedLot = lotRepository.save(lot);
        log.info("Lot created successfully with ID: {}", savedLot.getId());

        // Publish event
        publishLotEvent(savedLot, "CREATED");

        return mapToDTO(savedLot);
    }

    @Override
    @Transactional(readOnly = true)
    public LotDTO getLotById(String id) {
        log.debug("Fetching lot with ID: {}", id);

        Lot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + id));

        return mapToDTO(lot);
    }

    @Override
    @Transactional(readOnly = true)
    public LotDTO getLotByCode(String code) {
        log.debug("Fetching lot with code: {}", code);

        Lot lot = lotRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with code: " + code));

        return mapToDTO(lot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getAllLots() {
        log.debug("Fetching all lots");

        return lotRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getLotsByItemId(String itemId) {
        log.debug("Fetching lots for item ID: {}", itemId);

        return lotRepository.findByItemId(itemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getLotsBySupplierId(String supplierId) {
        log.debug("Fetching lots for supplier ID: {}", supplierId);

        return lotRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getLotsByStatus(String status) {
        log.debug("Fetching lots with status: {}", status);

        LotStatus lotStatus = LotStatus.valueOf(status.toUpperCase());
        return lotRepository.findByStatus(lotStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getExpiredLots() {
        log.debug("Fetching expired lots");

        LocalDate today = LocalDate.now();
        return lotRepository.findByExpiryDateBefore(today).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getLotsExpiringBetween(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching lots expiring between {} and {}", startDate, endDate);

        return lotRepository.findByExpiryDateBetween(startDate, endDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getActiveLotsForItem(String itemId) {
        log.debug("Fetching active lots for item: {}", itemId);

        return lotRepository.findByItemIdAndStatus(itemId, LotStatus.ACTIVE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LotDTO updateLot(String id, LotUpdateRequest request) {
        log.info("Updating lot with ID: {}", id);

        Lot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + id));

        // Update fields
        if (request.getLotNumber() != null) {
            lot.setLotNumber(request.getLotNumber());
        }
        if (request.getExpiryDate() != null) {
            lot.setExpiryDate(request.getExpiryDate());
        }
        if (request.getManufactureDate() != null) {
            lot.setManufactureDate(request.getManufactureDate());
        }
        if (request.getStatus() != null) {
            lot.setStatus(request.getStatus());
        }
        if (request.getAttributes() != null) {
            lot.setAttributes(request.getAttributes());
        }

        Lot savedLot = lotRepository.save(lot);
        log.info("Lot updated successfully");

        // Publish event
        publishLotEvent(savedLot, "UPDATED");

        return mapToDTO(savedLot);
    }

    @Override
    public LotDTO updateLotStatus(String id, String status) {
        log.info("Updating lot status for ID: {} to {}", id, status);

        Lot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + id));

        LotStatus lotStatus = LotStatus.valueOf(status.toUpperCase());
        lot.setStatus(lotStatus);

        Lot savedLot = lotRepository.save(lot);
        log.info("Lot status updated successfully");

        // Publish event
        publishLotEvent(savedLot, "STATUS_CHANGED");

        return mapToDTO(savedLot);
    }

    @Override
    public void deleteLot(String id) {
        log.info("Deleting lot with ID: {}", id);

        Lot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + id));

        lotRepository.delete(lot);
        log.info("Lot deleted successfully");

        // Publish event
        publishLotEvent(lot, "DELETED");
    }

    @Override
    @Transactional(readOnly = true)
    public Long countLotsByItem(String itemId) {
        log.debug("Counting lots for item: {}", itemId);
        return lotRepository.countByItemId(itemId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isLotExpired(String lotId) {
        log.debug("Checking if lot {} is expired", lotId);

        Lot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + lotId));

        if (lot.getExpiryDate() == null) {
            return false;
        }

        return lot.getExpiryDate().isBefore(LocalDate.now());
    }

    // ========== HELPER METHODS ==========

    private void publishLotEvent(Lot lot, String eventType) {
        LotEvent event = LotEvent.builder()
                .lotId(lot.getId())
                .lotCode(lot.getCode())
                .itemId(lot.getItemId())
                .lotNumber(lot.getLotNumber())
                .expiryDate(lot.getExpiryDate())
                .manufactureDate(lot.getManufactureDate())
                .status(lot.getStatus().name())
                .eventType(eventType)
                .timestamp(LocalDateTime.now())
                .build();

        eventPublisher.publishLotEvent(event);
    }

    private LotDTO mapToDTO(Lot lot) {
        return LotDTO.builder()
                .id(lot.getId())
                .code(lot.getCode())
                .itemId(lot.getItemId())
                .lotNumber(lot.getLotNumber())
                .expiryDate(lot.getExpiryDate())
                .manufactureDate(lot.getManufactureDate())
                .status(lot.getStatus())
                .attributes(lot.getAttributes())
                .createdAt(lot.getCreatedAt())
                .updatedAt(lot.getUpdatedAt())
                .build();
    }
}
