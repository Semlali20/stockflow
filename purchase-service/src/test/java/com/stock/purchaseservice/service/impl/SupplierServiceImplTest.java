package com.stock.purchaseservice.service.impl;

import com.stock.purchaseservice.dto.request.SupplierRequest;
import com.stock.purchaseservice.dto.response.SupplierResponse;
import com.stock.purchaseservice.entity.Supplier;
import com.stock.purchaseservice.enums.SupplierStatus;
import com.stock.purchaseservice.exception.ResourceNotFoundException;
import com.stock.purchaseservice.repository.SupplierRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class SupplierServiceImplTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierServiceImpl supplierService;

    private static final UUID ID = UUID.randomUUID();

    private Supplier buildSupplier() {
        return Supplier.builder()
                .id(ID)
                .name("Acme Corp")
                .email("acme@example.com")
                .phone("+1-555-0100")
                .address("123 Main St")
                .contactPerson("John Doe")
                .paymentTermsDays(30)
                .leadTimeDays(7)
                .status(SupplierStatus.ACTIVE)
                .notes("Reliable")
                .build();
    }

    private SupplierRequest buildRequest() {
        return SupplierRequest.builder()
                .name("Acme Corp")
                .email("acme@example.com")
                .phone("+1-555-0100")
                .address("123 Main St")
                .contactPerson("John Doe")
                .paymentTermsDays(30)
                .leadTimeDays(7)
                .status(SupplierStatus.ACTIVE)
                .notes("Reliable")
                .build();
    }

    // ── createSupplier ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("createSupplier: unique email → persists and maps response")
    void createSupplier_whenEmailIsUnique_returnsResponse() {
        given(supplierRepository.existsByEmail("acme@example.com")).willReturn(false);
        given(supplierRepository.save(any(Supplier.class))).willReturn(buildSupplier());

        SupplierResponse result = supplierService.createSupplier(buildRequest());

        assertThat(result.getName()).isEqualTo("Acme Corp");
        assertThat(result.getEmail()).isEqualTo("acme@example.com");
        assertThat(result.getStatus()).isEqualTo(SupplierStatus.ACTIVE);
        assertThat(result.getPaymentTermsDays()).isEqualTo(30);
        then(supplierRepository).should().save(any(Supplier.class));
    }

    @Test
    @DisplayName("createSupplier: duplicate email → throws IllegalArgumentException")
    void createSupplier_whenEmailAlreadyExists_throwsIllegalArgument() {
        given(supplierRepository.existsByEmail("acme@example.com")).willReturn(true);

        assertThatThrownBy(() -> supplierService.createSupplier(buildRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("acme@example.com");

        then(supplierRepository).should(never()).save(any());
    }

    @Test
    @DisplayName("createSupplier: null email → skips email uniqueness check")
    void createSupplier_whenEmailIsNull_doesNotCheckUniqueness() {
        SupplierRequest req = SupplierRequest.builder().name("No Mail").build();
        Supplier saved = Supplier.builder().id(ID).name("No Mail")
                .paymentTermsDays(30).leadTimeDays(7).status(SupplierStatus.ACTIVE).build();
        given(supplierRepository.save(any(Supplier.class))).willReturn(saved);

        supplierService.createSupplier(req);

        then(supplierRepository).should(never()).existsByEmail(any());
    }

    @Test
    @DisplayName("createSupplier: null paymentTermsDays → defaults to 30")
    void createSupplier_nullPaymentTerms_defaultsTo30() {
        SupplierRequest req = SupplierRequest.builder().name("X").build();
        given(supplierRepository.save(any(Supplier.class))).willAnswer(inv -> {
            Supplier s = inv.getArgument(0);
            assertThat(s.getPaymentTermsDays()).isEqualTo(30);
            assertThat(s.getLeadTimeDays()).isEqualTo(7);
            return Supplier.builder().id(ID).name("X").paymentTermsDays(30).leadTimeDays(7)
                    .status(SupplierStatus.ACTIVE).build();
        });

        supplierService.createSupplier(req);
    }

    // ── updateSupplier ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateSupplier: missing supplier → throws ResourceNotFoundException")
    void updateSupplier_whenNotFound_throws() {
        given(supplierRepository.findById(ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> supplierService.updateSupplier(ID, buildRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("updateSupplier: email used by another supplier → throws IllegalArgumentException")
    void updateSupplier_whenEmailTakenByOther_throwsIllegalArgument() {
        given(supplierRepository.findById(ID)).willReturn(Optional.of(buildSupplier()));
        given(supplierRepository.existsByEmailAndIdNot("acme@example.com", ID)).willReturn(true);

        assertThatThrownBy(() -> supplierService.updateSupplier(ID, buildRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("acme@example.com");
    }

    @Test
    @DisplayName("updateSupplier: success → updates and returns response")
    void updateSupplier_success() {
        Supplier existing = buildSupplier();
        given(supplierRepository.findById(ID)).willReturn(Optional.of(existing));
        given(supplierRepository.existsByEmailAndIdNot("acme@example.com", ID)).willReturn(false);
        given(supplierRepository.save(existing)).willReturn(existing);

        SupplierResponse result = supplierService.updateSupplier(ID, buildRequest());

        assertThat(result.getId()).isEqualTo(ID);
        assertThat(result.getName()).isEqualTo("Acme Corp");
        then(supplierRepository).should().save(existing);
    }

    // ── deleteSupplier ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteSupplier: missing supplier → throws ResourceNotFoundException")
    void deleteSupplier_whenNotFound_throws() {
        given(supplierRepository.findById(ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> supplierService.deleteSupplier(ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("deleteSupplier: existing supplier → calls repository.delete")
    void deleteSupplier_success_callsDelete() {
        Supplier supplier = buildSupplier();
        given(supplierRepository.findById(ID)).willReturn(Optional.of(supplier));

        supplierService.deleteSupplier(ID);

        then(supplierRepository).should().delete(supplier);
    }

    // ── getSupplierById ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("getSupplierById: missing → throws ResourceNotFoundException")
    void getSupplierById_whenNotFound_throws() {
        given(supplierRepository.findById(ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> supplierService.getSupplierById(ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getSupplierById: found → returns mapped response")
    void getSupplierById_success() {
        given(supplierRepository.findById(ID)).willReturn(Optional.of(buildSupplier()));

        SupplierResponse result = supplierService.getSupplierById(ID);

        assertThat(result.getId()).isEqualTo(ID);
        assertThat(result.getName()).isEqualTo("Acme Corp");
        assertThat(result.getContactPerson()).isEqualTo("John Doe");
    }

    // ── getAllSuppliers ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllSuppliers: delegates to repository and maps page")
    void getAllSuppliers_returnsMappedPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Supplier> repoPage = new PageImpl<>(List.of(buildSupplier()), pageable, 1);
        given(supplierRepository.findAll(pageable)).willReturn(repoPage);

        Page<SupplierResponse> result = supplierService.getAllSuppliers(pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Acme Corp");
    }

    // ── getActiveSuppliers ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getActiveSuppliers: returns only ACTIVE status suppliers")
    void getActiveSuppliers_returnsActiveOnly() {
        given(supplierRepository.findByStatus(SupplierStatus.ACTIVE))
                .willReturn(List.of(buildSupplier()));

        List<SupplierResponse> result = supplierService.getActiveSuppliers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(SupplierStatus.ACTIVE);
    }

    @Test
    @DisplayName("getActiveSuppliers: empty list when no active suppliers")
    void getActiveSuppliers_emptyWhenNone() {
        given(supplierRepository.findByStatus(SupplierStatus.ACTIVE)).willReturn(List.of());

        assertThat(supplierService.getActiveSuppliers()).isEmpty();
    }

    // ── searchSuppliers ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("searchSuppliers: delegates to repository and maps page")
    void searchSuppliers_returnsMappedPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Supplier> repoPage = new PageImpl<>(List.of(buildSupplier()), pageable, 1);
        given(supplierRepository.findByNameContainingIgnoreCase("acme", pageable))
                .willReturn(repoPage);

        Page<SupplierResponse> result = supplierService.searchSuppliers("acme", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Acme Corp");
    }
}
