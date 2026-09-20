package com.gramacare.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gramacare.backend.entity.ServiceEntity;
import com.gramacare.backend.entity.ServiceRequest;
import com.gramacare.backend.entity.User;
import com.gramacare.backend.services.RequestManager;
import com.gramacare.backend.services.ServicesManager;
import com.gramacare.backend.services.UserService;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final UserService userService;
    private final ServicesManager serviceManager;
    private final RequestManager requestManager;

    // ==============================
    // CONSTRUCTOR
    // ==============================

    public ProviderController(
            UserService userService,
            ServicesManager serviceManager,
            RequestManager requestManager) {

        this.userService = userService;
        this.serviceManager = serviceManager;
        this.requestManager = requestManager;
    }

    // ==============================
    // GET PROVIDER PROFILE
    // ==============================

    @GetMapping("/{providerId}")
    public ResponseEntity<User> getProvider(
            @PathVariable Long providerId) {

        User provider = userService.getById(providerId);

        return ResponseEntity.ok(provider);
    }

    // ==============================
    // GET PROVIDER SERVICES
    // ==============================

    @GetMapping("/{providerId}/services")
    public ResponseEntity<List<ServiceEntity>> getProviderServices(
            @PathVariable Long providerId) {

        List<ServiceEntity> services =
                serviceManager.getByProvider(providerId);

        return ResponseEntity.ok(services);
    }

    // ==============================
    // GET PROVIDER REQUESTS
    // ==============================

    @GetMapping("/{providerId}/requests")
    public ResponseEntity<List<ServiceRequest>> getProviderRequests(
            @PathVariable Long providerId) {

        List<ServiceRequest> requests =
                requestManager.getByProvider(providerId);

        return ResponseEntity.ok(requests);
    }
}