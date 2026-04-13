package com.stock.inventoryservice.service;

import com.stock.inventoryservice.dto.*;
import com.stock.inventoryservice.dto.request.LotCreateRequest;
import com.stock.inventoryservice.dto.request.LotUpdateRequest;

import java.time.LocalDate;
import java.util.List;

public interface LotService {

    // CRUD Operations
    LotDTO createLot(LotCreateRequest request);
    LotDTO getLotById(String id);
    LotDTO getLotByCode(String code);
    List<LotDTO> getAllLots();

    // Query Operations
    List<LotDTO> getLotsByItemId(String itemId);
    List<LotDTO> getLotsBySupplierId(String supplierId);
    List<LotDTO> getLotsByStatus(String status);
    List<LotDTO> getExpiredLots();
    List<LotDTO> getLotsExpiringBetween(LocalDate startDate, LocalDate endDate);
    List<LotDTO> getActiveLotsForItem(String itemId);

    // Update & Delete
            LotDTO updateLot(String id, LotUpdateRequest request);
    LotDTO updateLotStatus(String id, String status);
    void deleteLot(String id);

    // Utility
    Long countLotsByItem(String itemId);
    boolean isLotExpired(String lotId);
}
