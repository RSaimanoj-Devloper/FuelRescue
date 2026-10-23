package in.fuelrescue.repository;

import in.fuelrescue.entity.AssistanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssistanceRequestRepository extends JpaRepository<AssistanceRequest, String> {

    // Crucial for idempotent sync: look up by unique client request ID
    Optional<AssistanceRequest> findByClientRequestId(String clientRequestId);

    List<AssistanceRequest> findByUserIdOrderByCreatedAtDesc(String userId);

    List<AssistanceRequest> findByAssignedProviderIdOrderByCreatedAtDesc(String assignedProviderId);

    List<AssistanceRequest> findByRequestStatusOrderByCreatedAtDesc(String requestStatus);

    long countByRequestStatus(String requestStatus);
}
