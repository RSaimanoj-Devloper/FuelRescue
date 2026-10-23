package in.fuelrescue.controller;

import in.fuelrescue.entity.AssistanceRequest;
import in.fuelrescue.service.AssistanceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/requests")
@CrossOrigin(origins = "*")
public class AssistanceRequestController {

    private final AssistanceRequestService service;

    public AssistanceRequestController(AssistanceRequestService service) {
        this.service = service;
    }

    /**
     * POST /api/v1/requests/sync
     * Idempotent synchronization from client IndexedDB queue
     */
    @PostMapping("/sync")
    public ResponseEntity<AssistanceRequest> syncRequest(
            @RequestHeader(value = "X-Client-Request-Id", required = false) String headerClientId,
            @Valid @RequestBody AssistanceRequest request) {

        if (headerClientId != null && !headerClientId.isBlank()) {
            request.setClientRequestId(headerClientId);
        }

        AssistanceRequest synchronizedRequest = service.synchronizeRequest(request);
        return new ResponseEntity<>(synchronizedRequest, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<AssistanceRequest>> listRequests(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String providerId) {

        if (userId != null) {
            return ResponseEntity.ok(service.getRequestsForUser(userId));
        }
        if (providerId != null) {
            return ResponseEntity.ok(service.getRequestsForProvider(providerId));
        }
        return ResponseEntity.ok(service.getRequestsForUser("user-driver-demo"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssistanceRequest> getRequest(@PathVariable String id) {
        return service.getRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AssistanceRequest> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        String actorRole = payload.getOrDefault("actorRole", "PROVIDER");
        AssistanceRequest updated = service.updateStatus(id, newStatus, actorRole);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<AssistanceRequest> acceptRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String providerId = payload.getOrDefault("providerId", "PROV-TEL-01");
        String providerName = payload.getOrDefault("providerName", "Ramesh Reddy");
        String providerPhone = payload.getOrDefault("providerPhone", "+91 98492 88410");

        AssistanceRequest claimed = service.providerClaimRequest(id, providerId, providerName, providerPhone);
        return ResponseEntity.ok(claimed);
    }
}
