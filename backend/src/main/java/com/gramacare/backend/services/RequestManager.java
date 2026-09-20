package com.gramacare.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gramacare.backend.dto.ServiceRequestCreate;
import com.gramacare.backend.dto.StatusUpdaterequest;
import com.gramacare.backend.entity.NotificationType;
import com.gramacare.backend.entity.RequestStatus;
import com.gramacare.backend.entity.ServiceEntity;
import com.gramacare.backend.entity.ServiceRequest;
import com.gramacare.backend.entity.User;
import com.gramacare.backend.repository.ServiceRepository;
import com.gramacare.backend.repository.ServiceRequestRepository;
import com.gramacare.backend.repository.UserRepository;

@Service
public class RequestManager {

    private final ServiceRequestRepository requestRepository;

    private final UserRepository userRepository;

    private final ServiceRepository serviceRepository;

    private final NotificationServices notificationService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RequestManager(
            ServiceRequestRepository requestRepository,
            UserRepository userRepository,
            ServiceRepository serviceRepository,
            NotificationServices notificationService) {

        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.notificationService = notificationService;
    }

    // =====================================================
    // CREATE SERVICE REQUEST
    // =====================================================

    public ServiceRequest create(ServiceRequestCreate request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Request data cannot be null"
            );
        }

        if (request.getUserId() == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        if (request.getServiceId() == null) {
            throw new IllegalArgumentException(
                    "Service ID is required"
            );
        }

        // -------------------------------------------------
        // FIND CUSTOMER
        // -------------------------------------------------

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: "
                                        + request.getUserId()
                        )
                );

        // -------------------------------------------------
        // FIND SERVICE
        // -------------------------------------------------

        ServiceEntity service = serviceRepository
                .findById(request.getServiceId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Service not found with id: "
                                        + request.getServiceId()
                        )
                );

        // -------------------------------------------------
        // CHECK PROVIDER
        // -------------------------------------------------

        if (service.getProvider() == null) {
            throw new IllegalArgumentException(
                    "This service does not have a provider"
            );
        }

        // -------------------------------------------------
        // CREATE REQUEST
        // -------------------------------------------------

        ServiceRequest serviceRequest =
                new ServiceRequest();

        serviceRequest.setUser(user);

        serviceRequest.setService(service);

        serviceRequest.setMessage(
                request.getMessage()
        );

        serviceRequest.setStatus(
                RequestStatus.PENDING
        );

        // -------------------------------------------------
        // SAVE REQUEST
        // -------------------------------------------------

        ServiceRequest savedRequest =
                requestRepository.save(serviceRequest);

        // -------------------------------------------------
        // LOG
        // -------------------------------------------------

        System.out.println(
                "=============================================="
        );

        System.out.println(
                "SERVICE REQUEST CREATED"
        );

        System.out.println(
                "Request ID    : "
                        + savedRequest.getId()
        );

        System.out.println(
                "Customer ID   : "
                        + user.getId()
        );

        System.out.println(
                "Service ID    : "
                        + service.getId()
        );

        System.out.println(
                "Provider ID   : "
                        + service.getProvider().getId()
        );

        System.out.println(
                "Provider Name : "
                        + service.getProvider().getFullName()
        );

        System.out.println(
                "Status        : "
                        + savedRequest.getStatus()
        );

        System.out.println(
                "=============================================="
        );

        return savedRequest;
    }

    // =====================================================
    // GET REQUEST BY ID
    // =====================================================

    public ServiceRequest getById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Request ID is required"
            );
        }

        return requestRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Request not found with id: "
                                        + id
                        )
                );
    }

    // =====================================================
    // GET USER REQUESTS
    // =====================================================

    public List<ServiceRequest> getByUser(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return requestRepository.findByUserId(userId);
    }

    // =====================================================
    // GET PROVIDER REQUESTS
    // =====================================================

    public List<ServiceRequest> getByProvider(
            Long providerId) {

        if (providerId == null) {
            throw new IllegalArgumentException(
                    "Provider ID is required"
            );
        }

        System.out.println(
                "=============================================="
        );

        System.out.println(
                "GET PROVIDER REQUESTS"
        );

        System.out.println(
                "Provider ID : "
                        + providerId
        );

        List<ServiceRequest> requests =
                requestRepository
                        .findRequestsByProviderId(providerId);

        System.out.println(
                "Requests Found : "
                        + requests.size()
        );

        System.out.println(
                "=============================================="
        );

        return requests;
    }

    // =====================================================
    // UPDATE REQUEST STATUS
    // =====================================================

    @Transactional
    public ServiceRequest updateStatus(
            Long id,
            StatusUpdaterequest request) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Request ID is required"
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Status request cannot be null"
            );
        }

        if (request.getStatus() == null) {
            throw new IllegalArgumentException(
                    "Status is required"
            );
        }

        // -------------------------------------------------
        // FIND REQUEST
        // -------------------------------------------------

        ServiceRequest serviceRequest =
                getById(id);

        // -------------------------------------------------
        // DO NOT UPDATE DELETED REQUEST
        // -------------------------------------------------

        if (serviceRequest.getStatus()
                == RequestStatus.DELETED) {

            throw new IllegalStateException(
                    "Deleted request cannot be updated"
            );
        }

        // -------------------------------------------------
        // GET NEW STATUS
        // -------------------------------------------------

        RequestStatus newStatus =
                request.getStatus();

        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        serviceRequest.setStatus(newStatus);

        ServiceRequest updatedRequest =
                requestRepository.save(serviceRequest);

        // -------------------------------------------------
        // GET CUSTOMER
        // -------------------------------------------------

        User customer =
                serviceRequest.getUser();

        // -------------------------------------------------
        // GET PROVIDER
        // -------------------------------------------------

        User provider =
                serviceRequest
                        .getService()
                        .getProvider();

        // -------------------------------------------------
        // GET SERVICE NAME
        // -------------------------------------------------

        String serviceName =
                serviceRequest
                        .getService()
                        .getName();

        // =================================================
        // ACCEPTED
        // =================================================

        if (newStatus == RequestStatus.ACCEPTED) {

            notificationService.createNotification(
                    customer,
                    provider,
                    serviceRequest,
                    NotificationType.REQUEST_ACCEPTED,
                    "Request Accepted",
                    provider.getFullName()
                            + " accepted your "
                            + serviceName
                            + " request."
            );
        }

        // =================================================
        // REJECTED / NOT INTERESTED
        // =================================================

        else if (newStatus == RequestStatus.REJECTED) {

            notificationService.createNotification(
                    customer,
                    provider,
                    serviceRequest,
                    NotificationType.REQUEST_REJECTED,
                    "Request Not Interested",
                    provider.getFullName()
                            + " is not interested in your "
                            + serviceName
                            + " request."
            );
        }

        // =================================================
        // COMPLETED
        // =================================================

        else if (newStatus == RequestStatus.COMPLETED) {

            notificationService.createNotification(
                    customer,
                    provider,
                    serviceRequest,
                    NotificationType.REQUEST_COMPLETED,
                    "Request Completed",
                    provider.getFullName()
                            + " marked your "
                            + serviceName
                            + " request as completed."
            );
        }

        // -------------------------------------------------
        // LOG
        // -------------------------------------------------

        System.out.println(
                "=============================================="
        );

        System.out.println(
                "SERVICE REQUEST STATUS UPDATED"
        );

        System.out.println(
                "Request ID : "
                        + id
        );

        System.out.println(
                "New Status : "
                        + updatedRequest.getStatus()
        );

        System.out.println(
                "Customer ID : "
                        + customer.getId()
        );

        System.out.println(
                "Provider ID : "
                        + provider.getId()
        );

        System.out.println(
                "=============================================="
        );

        return updatedRequest;
    }

    // =====================================================
    // DELETE REQUEST
    // =====================================================
    //
    // IMPORTANT:
    // We DO NOT physically delete the database row.
    //
    // PENDING
    //    ↓
    // DELETED
    //
    // Customer can still see the deletion notification.
    // =====================================================

    @Transactional
    public ServiceRequest delete(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Request ID is required"
            );
        }

        // -------------------------------------------------
        // FIND REQUEST
        // -------------------------------------------------

        ServiceRequest serviceRequest =
                getById(id);

        // -------------------------------------------------
        // CHECK ALREADY DELETED
        // -------------------------------------------------

        if (serviceRequest.getStatus()
                == RequestStatus.DELETED) {

            return serviceRequest;
        }

        // -------------------------------------------------
        // GET CUSTOMER
        // -------------------------------------------------

        User customer =
                serviceRequest.getUser();

        // -------------------------------------------------
        // GET PROVIDER
        // -------------------------------------------------

        User provider =
                serviceRequest
                        .getService()
                        .getProvider();

        // -------------------------------------------------
        // GET SERVICE NAME
        // -------------------------------------------------

        String serviceName =
                serviceRequest
                        .getService()
                        .getName();

        // -------------------------------------------------
        // SOFT DELETE
        // -------------------------------------------------

        serviceRequest.setStatus(
                RequestStatus.DELETED
        );

        ServiceRequest deletedRequest =
                requestRepository.save(serviceRequest);

        // =================================================
        // CREATE DELETE NOTIFICATION
        // =================================================

        notificationService.createNotification(
                customer,
                provider,
                serviceRequest,
                NotificationType.REQUEST_DELETED,
                "Request Deleted",
                provider.getFullName()
                        + " deleted your "
                        + serviceName
                        + " request."
        );

        // -------------------------------------------------
        // LOG
        // -------------------------------------------------

        System.out.println(
                "=============================================="
        );

        System.out.println(
                "SERVICE REQUEST MARKED AS DELETED"
        );

        System.out.println(
                "Request ID : "
                        + id
        );

        System.out.println(
                "Customer ID : "
                        + customer.getId()
        );

        System.out.println(
                "Provider ID : "
                        + provider.getId()
        );

        System.out.println(
                "Status : "
                        + deletedRequest.getStatus()
        );

        System.out.println(
                "=============================================="
        );

        return deletedRequest;
    }
}