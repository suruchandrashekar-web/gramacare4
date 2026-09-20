package com.gramacare.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gramacare.backend.entity.ServiceEntity;
import com.gramacare.backend.entity.User;
import com.gramacare.backend.repository.ServiceRepository;
import com.gramacare.backend.repository.ServiceRequestRepository;
import com.gramacare.backend.repository.UserRepository;

@Service
public class ServicesManager {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;
    private final ServiceRequestRepository serviceRequestRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ServicesManager(
            ServiceRepository serviceRepository,
            UserRepository userRepository,
            GeocodingService geocodingService,
            ServiceRequestRepository serviceRequestRepository) {

        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.geocodingService = geocodingService;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    // =========================================================
    // BLOCKED ACCOUNT CHECK
    // =========================================================

    private void checkProviderActive(User provider) {

        if (provider == null) {
            throw new IllegalArgumentException(
                    "Provider not found."
            );
        }

        if (provider.isBlocked()) {
            throw new IllegalStateException(
                    "Your account has been blocked by the administrator. "
                    + "You cannot use services until your account is unblocked."
            );
        }
    }

    // =========================================================
    // GET ALL SERVICES
    // =========================================================

    public List<ServiceEntity> getAll() {

        return serviceRepository.findAll();
    }

    // =========================================================
    // GET AVAILABLE SERVICES
    // =========================================================

    public List<ServiceEntity> getAvailable() {

        return serviceRepository.findByAvailableTrue();
    }

    // =========================================================
    // GET SERVICE BY ID
    // =========================================================

    public ServiceEntity getById(Long id) {

        return serviceRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Service not found with id: " + id
                        )
                );
    }

    // =========================================================
    // GET SERVICES BY PROVIDER
    // =========================================================

    public List<ServiceEntity> getByProvider(Long providerId) {

        if (providerId == null) {
            throw new IllegalArgumentException(
                    "Provider ID is required."
            );
        }

        User provider = userRepository.findById(providerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Provider not found with id: "
                                        + providerId
                        )
                );

        checkProviderActive(provider);

        return serviceRepository.findByProviderId(providerId);
    }

    // =========================================================
    // CREATE SERVICE
    // =========================================================

    public ServiceEntity create(
            Long providerId,
            ServiceEntity service) {

        // -----------------------------------------------------
        // VALIDATE PROVIDER ID
        // -----------------------------------------------------

        if (providerId == null) {
            throw new IllegalArgumentException(
                    "Provider ID is required."
            );
        }

        // -----------------------------------------------------
        // FIND PROVIDER
        // -----------------------------------------------------

        User provider = userRepository.findById(providerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Provider not found with id: "
                                        + providerId
                        )
                );

        // -----------------------------------------------------
        // BLOCKED ACCOUNT CHECK
        // -----------------------------------------------------

        checkProviderActive(provider);

        // -----------------------------------------------------
        // VALIDATE SERVICE
        // -----------------------------------------------------

        if (service == null) {
            throw new IllegalArgumentException(
                    "Service data is required."
            );
        }

        // -----------------------------------------------------
        // VALIDATE SERVICE NAME
        // -----------------------------------------------------

        if (service.getName() == null ||
                service.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Service name is required."
            );
        }

        // -----------------------------------------------------
        // GET LOCATION
        // -----------------------------------------------------

        String location = service.getLocation();

        if (location == null ||
                location.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Village and district are required."
            );
        }

        // -----------------------------------------------------
        // SPLIT LOCATION
        // -----------------------------------------------------

        String[] locationParts =
                location.split(",");

        if (locationParts.length < 2) {

            throw new IllegalArgumentException(
                    "Please provide village and district."
            );
        }

        String village =
                locationParts[0].trim();

        String district =
                locationParts[1].trim();

        // -----------------------------------------------------
        // VALIDATE VILLAGE
        // -----------------------------------------------------

        if (village.isEmpty()) {

            throw new IllegalArgumentException(
                    "Village is required."
            );
        }

        // -----------------------------------------------------
        // VALIDATE DISTRICT
        // -----------------------------------------------------

        if (district.isEmpty()) {

            throw new IllegalArgumentException(
                    "District is required."
            );
        }

        // -----------------------------------------------------
        // GEOCODE LOCATION
        // -----------------------------------------------------

        GeocodingService.Coordinates coordinates =
                geocodingService.geocode(
                        village,
                        district
                );

        // -----------------------------------------------------
        // SET PROVIDER
        // -----------------------------------------------------

        service.setProvider(provider);

        // -----------------------------------------------------
        // SET CLEAN LOCATION
        // -----------------------------------------------------

        service.setLocation(
                village + ", " + district
        );

        // -----------------------------------------------------
        // SET LATITUDE
        // -----------------------------------------------------

        service.setLatitude(
                coordinates.getLatitude()
        );

        // -----------------------------------------------------
        // SET LONGITUDE
        // -----------------------------------------------------

        service.setLongitude(
                coordinates.getLongitude()
        );

        // -----------------------------------------------------
        // SAVE SERVICE
        // -----------------------------------------------------

        ServiceEntity savedService =
                serviceRepository.save(service);

        // -----------------------------------------------------
        // CONSOLE DEBUG
        // -----------------------------------------------------

        System.out.println(
                "======================================"
        );

        System.out.println(
                "SERVICE CREATED"
        );

        System.out.println(
                "Service ID: "
                        + savedService.getId()
        );

        System.out.println(
                "Service Name: "
                        + savedService.getName()
        );

        System.out.println(
                "Provider ID: "
                        + (
                                savedService.getProvider() != null
                                        ? savedService
                                                .getProvider()
                                                .getId()
                                        : "NULL"
                        )
        );

        System.out.println(
                "Provider Name: "
                        + (
                                savedService.getProvider() != null
                                        ? savedService
                                                .getProvider()
                                                .getFullName()
                                        : "NULL"
                        )
        );

        System.out.println(
                "Service Location: "
                        + savedService.getLocation()
        );

        System.out.println(
                "Latitude: "
                        + savedService.getLatitude()
        );

        System.out.println(
                "Longitude: "
                        + savedService.getLongitude()
        );

        System.out.println(
                "======================================"
        );

        return savedService;
    }

    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    public ServiceEntity update(
            Long id,
            ServiceEntity updatedService) {

        // -----------------------------------------------------
        // FIND EXISTING SERVICE
        // -----------------------------------------------------

        ServiceEntity existingService =
                getById(id);

        // -----------------------------------------------------
        // FIND PROVIDER
        // -----------------------------------------------------

        User provider =
                existingService.getProvider();

        // -----------------------------------------------------
        // BLOCKED ACCOUNT CHECK
        // -----------------------------------------------------

        checkProviderActive(provider);

        // -----------------------------------------------------
        // VALIDATE UPDATED SERVICE
        // -----------------------------------------------------

        if (updatedService == null) {

            throw new IllegalArgumentException(
                    "Service data is required."
            );
        }

        // -----------------------------------------------------
        // UPDATE SERVICE NAME
        // -----------------------------------------------------

        if (updatedService.getName() != null &&
                !updatedService.getName().trim().isEmpty()) {

            existingService.setName(
                    updatedService.getName().trim()
            );
        }

        // -----------------------------------------------------
        // UPDATE DESCRIPTION
        // -----------------------------------------------------

        existingService.setDescription(
                updatedService.getDescription()
        );

        // -----------------------------------------------------
        // UPDATE PRICE
        // -----------------------------------------------------

        existingService.setPrice(
                updatedService.getPrice()
        );

        // -----------------------------------------------------
        // UPDATE CATEGORY
        // -----------------------------------------------------

        existingService.setCategory(
                updatedService.getCategory()
        );

        // -----------------------------------------------------
        // UPDATE AVAILABILITY
        // -----------------------------------------------------

        existingService.setAvailable(
                updatedService.isAvailable()
        );

        // -----------------------------------------------------
        // GET NEW LOCATION
        // -----------------------------------------------------

        String location =
                updatedService.getLocation();

        if (location == null ||
                location.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Village and district are required."
            );
        }

        // -----------------------------------------------------
        // SPLIT LOCATION
        // -----------------------------------------------------

        String[] locationParts =
                location.split(",");

        if (locationParts.length < 2) {

            throw new IllegalArgumentException(
                    "Please provide village and district."
            );
        }

        String village =
                locationParts[0].trim();

        String district =
                locationParts[1].trim();

        // -----------------------------------------------------
        // VALIDATE VILLAGE
        // -----------------------------------------------------

        if (village.isEmpty()) {

            throw new IllegalArgumentException(
                    "Village is required."
            );
        }

        // -----------------------------------------------------
        // VALIDATE DISTRICT
        // -----------------------------------------------------

        if (district.isEmpty()) {

            throw new IllegalArgumentException(
                    "District is required."
            );
        }

        // -----------------------------------------------------
        // GEOCODE NEW LOCATION
        // -----------------------------------------------------

        GeocodingService.Coordinates coordinates =
                geocodingService.geocode(
                        village,
                        district
                );

        // -----------------------------------------------------
        // UPDATE LOCATION
        // -----------------------------------------------------

        existingService.setLocation(
                village + ", " + district
        );

        // -----------------------------------------------------
        // UPDATE LATITUDE
        // -----------------------------------------------------

        existingService.setLatitude(
                coordinates.getLatitude()
        );

        // -----------------------------------------------------
        // UPDATE LONGITUDE
        // -----------------------------------------------------

        existingService.setLongitude(
                coordinates.getLongitude()
        );

        // -----------------------------------------------------
        // DO NOT CHANGE PROVIDER
        // -----------------------------------------------------

        existingService.setProvider(provider);

        // -----------------------------------------------------
        // SAVE UPDATED SERVICE
        // -----------------------------------------------------

        ServiceEntity savedService =
                serviceRepository.save(
                        existingService
                );

        // -----------------------------------------------------
        // DEBUG
        // -----------------------------------------------------

        System.out.println(
                "======================================"
        );

        System.out.println(
                "SERVICE UPDATED"
        );

        System.out.println(
                "Service ID: "
                        + savedService.getId()
        );

        System.out.println(
                "Service Name: "
                        + savedService.getName()
        );

        System.out.println(
                "Provider ID: "
                        + (
                                savedService.getProvider() != null
                                        ? savedService
                                                .getProvider()
                                                .getId()
                                        : "NULL"
                        )
        );

        System.out.println(
                "======================================"
        );

        return savedService;
    }

    // =========================================================
    // UPDATE AVAILABILITY
    // =========================================================

    public ServiceEntity updateAvailability(
            Long id,
            boolean available) {

        ServiceEntity service =
                getById(id);

        // -----------------------------------------------------
        // BLOCKED ACCOUNT CHECK
        // -----------------------------------------------------

        checkProviderActive(
                service.getProvider()
        );

        service.setAvailable(
                available
        );

        return serviceRepository.save(
                service
        );
    }

    // =========================================================
    // DELETE SERVICE PERMANENTLY
    // =========================================================

    @Transactional
    public void delete(Long id) {

        // -----------------------------------------------------
        // FIND SERVICE
        // -----------------------------------------------------

        ServiceEntity service =
                getById(id);

        // -----------------------------------------------------
        // BLOCKED ACCOUNT CHECK
        // -----------------------------------------------------

        checkProviderActive(
                service.getProvider()
        );

        // -----------------------------------------------------
        // DELETE NOTIFICATIONS
        // -----------------------------------------------------

        int deletedNotifications =
                serviceRequestRepository
                        .deleteNotificationsByServiceId(id);

        System.out.println(
                "Deleted notifications: "
                        + deletedNotifications
        );

        // -----------------------------------------------------
        // FORCE NOTIFICATION DELETE
        // -----------------------------------------------------

        serviceRequestRepository.flush();

        // -----------------------------------------------------
        // DELETE SERVICE REQUESTS
        // -----------------------------------------------------

        int deletedRequests =
                serviceRequestRepository
                        .deleteByServiceId(id);

        System.out.println(
                "Deleted service requests: "
                        + deletedRequests
        );

        // -----------------------------------------------------
        // FORCE REQUEST DELETE
        // -----------------------------------------------------

        serviceRequestRepository.flush();

        // -----------------------------------------------------
        // DELETE SERVICE
        // -----------------------------------------------------

        serviceRepository.deleteById(id);

        // -----------------------------------------------------
        // FORCE SERVICE DELETE
        // -----------------------------------------------------

        serviceRepository.flush();

        // -----------------------------------------------------
        // SUCCESS LOG
        // -----------------------------------------------------

        System.out.println(
                "SERVICE PERMANENTLY DELETED: "
                        + id
        );
    }
}