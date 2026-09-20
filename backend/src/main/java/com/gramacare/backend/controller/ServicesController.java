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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gramacare.backend.entity.ServiceEntity;
import com.gramacare.backend.services.ServicesManager;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5182",
    "http://localhost:8091"
})
public class ServicesController {

    private final ServicesManager serviceManager;

    public ServicesController(ServicesManager serviceManager) {
        this.serviceManager = serviceManager;
    }

    @GetMapping
    public ResponseEntity<List<ServiceEntity>> getAllServices() {
        List<ServiceEntity> services = serviceManager.getAll();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/available")
    public ResponseEntity<List<ServiceEntity>> getAvailableServices() {
        List<ServiceEntity> services = serviceManager.getAvailable();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceEntity> getServiceById(
            @PathVariable Long id) {

        ServiceEntity service = serviceManager.getById(id);
        return ResponseEntity.ok(service);
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ServiceEntity>> getProviderServices(
            @PathVariable Long providerId) {

        List<ServiceEntity> services =
                serviceManager.getByProvider(providerId);

        return ResponseEntity.ok(services);
    }

    @PostMapping("/provider/{providerId}")
    public ResponseEntity<ServiceEntity> createService(
            @PathVariable Long providerId,
            @RequestBody ServiceEntity service) {

        ServiceEntity createdService =
                serviceManager.create(providerId, service);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdService);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceEntity> updateService(
            @PathVariable Long id,
            @RequestBody ServiceEntity service) {

        ServiceEntity updatedService =
                serviceManager.update(id, service);

        return ResponseEntity.ok(updatedService);
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<ServiceEntity> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean available) {

        ServiceEntity service =
                serviceManager.updateAvailability(id, available);

        return ResponseEntity.ok(service);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long id) {

        serviceManager.delete(id);

        return ResponseEntity.noContent().build();
    }
}