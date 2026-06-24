package com.stock.locationservice.service;


import com.stock.locationservice.dto.WarehouseCreateRequest;
import com.stock.locationservice.dto.WarehouseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WarehouseService {

    WarehouseDTO createWarehouse(WarehouseCreateRequest request);

    WarehouseDTO getWarehouseById(String id);

    WarehouseDTO getWarehouseByCode(String code);

    Page<WarehouseDTO> getAllWarehouses(String siteId, Boolean active, Pageable pageable);

    WarehouseDTO updateWarehouse(String id, WarehouseCreateRequest request);

    void deleteWarehouse(String id);

    void activateWarehouse(String id);

    void deactivateWarehouse(String id);
}
