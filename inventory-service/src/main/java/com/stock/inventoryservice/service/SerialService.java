package com.stock.inventoryservice.service;

import com.stock.inventoryservice.dto.*;
import com.stock.inventoryservice.dto.request.SerialCreateRequest;
import com.stock.inventoryservice.dto.request.SerialUpdateRequest;

import java.util.List;

public interface SerialService {

    // CRUD Operations
    SerialDTO createSerial(SerialCreateRequest request);
    SerialDTO getSerialById(String id);
    SerialDTO getSerialByCode(String code);
    SerialDTO getSerialBySerialNumber(String serialNumber);
    List<SerialDTO> getAllSerials();

    // Query Operations
    List<SerialDTO> getSerialsByItemId(String itemId);
    List<SerialDTO> getSerialsByLotId(String lotId);
    List<SerialDTO> getSerialsByLocationId(String locationId);
    List<SerialDTO> getSerialsByStatus(String status);
    List<SerialDTO> getSerialsByItemIdAndStatus(String itemId, String status);
    List<SerialDTO> getAvailableSerials(String itemId);

    // Update & Delete
    SerialDTO updateSerial(String id, SerialUpdateRequest request);
    SerialDTO updateSerialStatus(String id, String status);
    SerialDTO updateSerialLocation(String id, String locationId);
    void deleteSerial(String id);

    // Utility
    Long countSerialsByLot(String lotId);
    Long countSerialsByItem(String itemId);
    boolean isSerialAvailable(String serialNumber);
}
