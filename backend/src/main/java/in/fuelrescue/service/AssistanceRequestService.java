package in.fuelrescue.service;

import in.fuelrescue.entity.AssistanceRequest;
import in.fuelrescue.repository.AssistanceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AssistanceRequestService {

    private final AssistanceRequestRepository repository;

    public AssistanceRequestService(AssistanceRequestRepository repository) {
        this.repository = repository;
    }

    /**
     * Idempotent Synchronization & Request Creation
     * If the clientRequestId already exists in the database, return the existing entity without duplicates.
     */
    @Transactional
    public AssistanceRequest synchronizeRequest(AssistanceRequest incoming) {
        // Idempotency check
        Optional<AssistanceRequest> existing = repository.findByClientRequestId(incoming.getClientRequestId());
        if (existing.isPresent()) {
            return existing.get();
        }

        // Generate server ID
        String serverId = "FR-2026-" + (8920 + repository.count() + 1);
        incoming.setId(serverId);
        incoming.setSyncStatus("SYNCED");
        incoming.setSynchronizedAt(Instant.now());

        if (incoming.getRequestStatus() == null || incoming.getRequestStatus().equals("PENDING_SYNC")) {
            incoming.setRequestStatus("MATCHING");
        }

        // Pricing calculation (Telangana PPAC verified rates)
        BigDecimal fuelPrice = "PETROL".equalsIgnoreCase(incoming.getFuelType())
                ? new BigDecimal("109.66")
                : new BigDecimal("97.82");
        BigDecimal fuelCost = fuelPrice.multiply(incoming.getRequestedQuantity());
        BigDecimal deliveryFee = new BigDecimal("250.00"); // Standard emergency highway response fee
        incoming.setEstimatedCost(fuelCost.add(deliveryFee));
        incoming.setPaymentStatus("PENDING");

        return repository.save(incoming);
    }

    @Transactional(readOnly = true)
    public List<AssistanceRequest> getRequestsForUser(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<AssistanceRequest> getRequestsForProvider(String providerId) {
        return repository.findByAssignedProviderIdOrderByCreatedAtDesc(providerId);
    }

    @Transactional(readOnly = true)
    public Optional<AssistanceRequest> getRequestById(String id) {
        return repository.findById(id);
    }

    @Transactional
    public AssistanceRequest updateStatus(String id, String newStatus, String actorRole) {
        AssistanceRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        request.setRequestStatus(newStatus);
        if ("DELIVERED".equals(newStatus)) {
            request.setConfirmedCost(request.getEstimatedCost());
        }
        if ("COMPLETED".equals(newStatus)) {
            request.setPaymentStatus("CONFIRMED");
        }

        return repository.save(request);
    }

    @Transactional
    public AssistanceRequest providerClaimRequest(String id, String providerId, String providerName, String providerPhone) {
        AssistanceRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!"MATCHING".equals(request.getRequestStatus()) && !"SYNCED".equals(request.getRequestStatus())) {
            throw new IllegalStateException("Request is already claimed or in status: " + request.getRequestStatus());
        }

        request.setAssignedProviderId(providerId);
        request.setRequestStatus("PROVIDER_ACCEPTED");
        request.setEtaMinutes(18);

        return repository.save(request);
    }
}
