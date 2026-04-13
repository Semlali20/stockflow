package com.stock.locationservice.service;


import com.stock.locationservice.dto.WarehouseCreateRequest;
import com.stock.locationservice.dto.WarehouseDTO;

import java.util.List;

public interface WarehouseService {

    WarehouseDTO createWarehouse(WarehouseCreateRequest request);

    WarehouseDTO getWarehouseById(String id);

    WarehouseDTO getWarehouseByCode(String code);

    List<WarehouseDTO> getAllWarehouses();

    List<WarehouseDTO> getWarehousesBySiteId(String siteId);

    List<WarehouseDTO> getActiveWarehouses();

    WarehouseDTO updateWarehouse(String id, WarehouseCreateRequest request);

    void deleteWarehouse(String id);

    void activateWarehouse(String id);

    void deactivateWarehouse(String id);
}
