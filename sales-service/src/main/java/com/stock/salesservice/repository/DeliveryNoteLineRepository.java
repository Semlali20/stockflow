package com.stock.salesservice.repository;

import com.stock.salesservice.entity.DeliveryNoteLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryNoteLineRepository extends JpaRepository<DeliveryNoteLine, UUID> {

    List<DeliveryNoteLine> findByDeliveryNoteId(UUID deliveryNoteId);

    void deleteByDeliveryNoteId(UUID deliveryNoteId);
}
