package com.stock.alertservice.service;

import com.stock.alertservice.dto.cache.InventorySnapshotDTO;

import java.util.Optional;

/**
 * Service pour gérer le cache Redis des inventaires
 */
public interface InventoryCacheService {

    /**
     * Mettre en cache un inventaire
     */
    void cacheInventory(InventorySnapshotDTO inventory);

    /**
     * Récupérer un inventaire du cache
     */
    Optional<InventorySnapshotDTO> getInventory(String inventoryId);

    /**
     * Mettre à jour un inventaire dans le cache
     */
    void updateInventory(InventorySnapshotDTO inventory);

    /**
     * Supprimer un inventaire du cache
     */
    void deleteInventory(String inventoryId);

    /**
     * Vérifier si un inventaire existe dans le cache
     */
    boolean existsInCache(String inventoryId);

    /**
     * Vider tout le cache des inventaires
     */
    void clearCache();
}
