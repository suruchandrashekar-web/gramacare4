package com.gramacare.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gramacare.backend.dto.ServiceRequestCreate;
import com.gramacare.backend.dto.StatusUpdaterequest;
import com.gramacare.backend.entity.ServiceRequest;
import com.gramacare.backend.services.RequestManager;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {
                org.springframework.web.bind.annotation.RequestMethod.GET,
                org.springframework.web.bind.annotation.RequestMethod.POST,
                org.springframework.web.bind.annotation.RequestMethod.PUT,
                org.springframework.web.bind.annotation.RequestMethod.PATCH,
                org.springframework.web.bind.annotation.RequestMethod.DELETE,
                org.springframework.web.bind.annotation.RequestMethod.OPTIONS
        }
)
public class RequestController {

    private final RequestManager requestManager;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RequestController(RequestManager requestManager) {
        this.requestManager = requestManager;
    }

    // =====================================================
    // CREATE SERVICE REQUEST
    // POST /api/requests
    // =====================================================

    @PostMapping
    public ResponseEntity<ServiceRequest> createRequest(
            @RequestBody ServiceRequestCreate request) {

        ServiceRequest createdRequest =
                requestManager.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdRequest);
    }

    // =====================================================
    // GET REQUEST BY ID
    // GET /api/requests/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequest> getRequestById(
            @PathVariable Long id) {

        ServiceRequest request =
                requestManager.getById(id);

        return ResponseEntity.ok(request);
    }

    // =====================================================
    // GET USER REQUESTS
    // GET /api/requests/user/{userId}
    // =====================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceRequest>> getUserRequests(
            @PathVariable Long userId) {

        List<ServiceRequest> requests =
                requestManager.getByUser(userId);

        return ResponseEntity.ok(requests);
    }

    // =====================================================
    // GET PROVIDER REQUESTS
    // GET /api/requests/provider/{providerId}
    // =====================================================

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ServiceRequest>> getProviderRequests(
            @PathVariable Long providerId) {

        List<ServiceRequest> requests =
                requestManager.getByProvider(providerId);

        return ResponseEntity.ok(requests);
    }

    // =====================================================
    // UPDATE REQUEST STATUS
    // PATCH /api/requests/{id}/status
    // =====================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdaterequest request) {

        ServiceRequest updatedRequest =
                requestManager.updateStatus(
                        id,
                        request
                );

        return ResponseEntity.ok(updatedRequest);
    }

    // =====================================================
    // DELETE REQUEST
    // DELETE /api/requests/{id}
    //
    // IMPORTANT:
    // This does NOT physically delete the request.
    // RequestManager changes status to DELETED.
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ServiceRequest> deleteRequest(
            @PathVariable Long id) {

        ServiceRequest deletedRequest =
                requestManager.delete(id);

        return ResponseEntity.ok(deletedRequest);
    }
}