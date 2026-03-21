package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.entity.Inventory;
import com.stock.inventoryservice.exception.InsufficientStockException;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import com.stock.inventoryservice.repository.InventoryRepository;
import com.stock.inventoryservice.service.StockReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StockReservationServiceImpl implements StockReservationService {

    private final InventoryRepository inventoryRepository;

    @Override
    public void reserveStock(String inventoryId, BigDecimal quantity, String reservationId) {
        log.info("Reserving {} units for inventory: {} (reservation: {})",
                quantity, inventoryId, reservationId);

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + inventoryId));

        Double availableQuantity = inventory.getAvailableQuantity();

        if (BigDecimal.valueOf(availableQuantity).compareTo(quantity) < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock for reservation. Available: " + availableQuantity +
                            ", Requested: " + quantity);
        }

        log.info("Stock reservation validated successfully");
    }


    @Override
    public void releaseReservation(String inventoryId, BigDecimal quantity, String reservationId) {
        log.info("Releasing reservation {} for inventory: {} ({} units)",
                reservationId, inventoryId, quantity);

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + inventoryId));

        // In a real system, you would remove the reservation from the reservations table
        log.info("Reservation released successfully");
    }

    @Override
    public void fulfillReservation(String inventoryId, BigDecimal quantity, String reservationId) {
        log.info("Fulfilling reservation {} for inventory: {} ({} units)",
                reservationId, inventoryId, quantity);

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + inventoryId));

        Double newQuantity = inventory.getQuantityOnHand() - quantity.doubleValue();

        if (newQuantity < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock to fulfill reservation. Available: " + inventory.getQuantityOnHand() +
                            ", Required: " + quantity);
        }

        inventory.setQuantityOnHand(newQuantity);
        inventoryRepository.save(inventory);

        log.info("Reservation fulfilled and stock deducted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getAvailableQuantity(String inventoryId) {
        log.info("Getting available quantity for inventory: {}", inventoryId);

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + inventoryId));

        return BigDecimal.valueOf(inventory.getAvailableQuantity());
    }
}