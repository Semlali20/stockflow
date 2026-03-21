package com.stock.productservice.repository;

import com.stock.productservice.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {

    Optional<Item> findBySku(String sku);

    List<Item> findByCategoryId(String categoryId);

    List<Item> findByIsActive(Boolean isActive);

    List<Item> findByCategoryIdAndIsActive(String categoryId, Boolean isActive);

    boolean existsBySku(String sku);

    @Query("SELECT i FROM Item i WHERE i.categoryId = :categoryId AND i.isActive = true")
    List<Item> findActiveItemsByCategory(@Param("categoryId") String categoryId);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.categoryId = :categoryId")
    Long countByCategoryId(@Param("categoryId") String categoryId);

    @Query("SELECT i FROM Item i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Item> searchItems(@Param("keyword") String keyword);
}