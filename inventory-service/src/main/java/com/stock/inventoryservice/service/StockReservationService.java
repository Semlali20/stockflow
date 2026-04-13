package com.stock.inventoryservice.service;

import java.math.BigDecimal;

public interface StockReservationService {

    void reserveStock(String inventoryId, BigDecimal quantity, String reservationId);

    void releaseReservation(String inventoryId, BigDecimal quantity, String reservationId);

    void fulfillReservation(String inventoryId, BigDecimal quantity, String reservationId);

    BigDecimal getAvailableQuantity(String inventoryId);
}