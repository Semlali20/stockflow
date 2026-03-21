package com.stock.productservice.repository;

import com.stock.productservice.entity.ItemVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemVariantRepository extends JpaRepository<ItemVariant, String> {

    Optional<ItemVariant> findBySku(String sku);

    List<ItemVariant> findByParentItemId(String parentItemId);

    List<ItemVariant> findByIsActive(Boolean isActive);

    boolean existsBySku(String sku);

    @Query("SELECT iv FROM ItemVariant iv WHERE iv.isActive = true")
    List<ItemVariant> findActiveItemVariants();

    @Query("SELECT iv FROM ItemVariant iv WHERE LOWER(iv.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ItemVariant> searchItemVariants(@Param("keyword") String keyword);
}