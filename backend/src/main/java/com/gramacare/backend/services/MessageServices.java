package com.gramacare.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gramacare.backend.entity.Message;
import com.gramacare.backend.entity.Role;
import com.gramacare.backend.entity.ServiceRequest;
import com.gramacare.backend.entity.User;
import com.gramacare.backend.repository.MessageRepository;
import com.gramacare.backend.repository.ServiceRequestRepository;
import com.gramacare.backend.repository.UserRepository;

@Service
public class MessageServices {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    public MessageServices(
            MessageRepository messageRepository,
            UserRepository userRepository,
            ServiceRequestRepository serviceRequestRepository) {

        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    // =====================================================
    // SEND MESSAGE
    // =====================================================

    public Message sendMessage(
            Long senderId,
            Long receiverId,
            Long requestId,
            String messageText,
            Role senderRole,
            Role receiverRole) {

        if (senderId == null) {
            throw new RuntimeException("Sender ID is required");
        }

        if (receiverId == null) {
            throw new RuntimeException("Receiver ID is required");
        }

        if (messageText == null || messageText.trim().isEmpty()) {
            throw new RuntimeException("Message cannot be empty");
        }

        // -------------------------------------------------
        // FIND SENDER
        // -------------------------------------------------

        User sender = userRepository.findById(senderId)
                .orElseThrow(() ->
                        new RuntimeException("Sender not found: " + senderId));

        // -------------------------------------------------
        // FIND RECEIVER
        // -------------------------------------------------

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->
                        new RuntimeException("Receiver not found: " + receiverId));

        // -------------------------------------------------
        // CREATE MESSAGE
        // -------------------------------------------------

        Message message = new Message();

        message.setSender(sender);
        message.setReceiver(receiver);

        message.setMessage(messageText.trim());

        message.setSenderRole(senderRole);
        message.setReceiverRole(receiverRole);

        message.setRead(false);

        // -------------------------------------------------
        // OPTIONAL SERVICE REQUEST
        // -------------------------------------------------

        if (requestId != null) {

            ServiceRequest request = serviceRequestRepository
                    .findById(requestId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Service request not found: " + requestId));

            /*
             * Security check:
             *
             * Sender and receiver must belong to this request.
             *
             * Customer = request.user
             * Provider = request.service.provider
             */

            Long customerId = request.getUser().getId();

            Long providerId = request.getService()
                    .getProvider()
                    .getId();

            boolean validConversation =
                    (senderId.equals(customerId)
                            && receiverId.equals(providerId))
                    ||
                    (senderId.equals(providerId)
                            && receiverId.equals(customerId));

            if (!validConversation) {
                throw new RuntimeException(
                        "You are not allowed to message users for this request");
            }

            message.setRequest(request);
        }

        // -------------------------------------------------
        // SAVE MESSAGE TO DATABASE
        // -------------------------------------------------

        return messageRepository.save(message);
    }

    // =====================================================
    // GET RECEIVED MESSAGES
    // =====================================================

    public List<Message> getReceivedMessages(Long receiverId) {

        if (receiverId == null) {
            throw new RuntimeException("Receiver ID is required");
        }

        return messageRepository
                .findByReceiverIdOrderByCreatedAtAsc(receiverId);
    }

    // =====================================================
    // GET SENT MESSAGES
    // =====================================================

    public List<Message> getSentMessages(Long senderId) {

        if (senderId == null) {
            throw new RuntimeException("Sender ID is required");
        }

        return messageRepository
                .findBySenderIdOrderByCreatedAtAsc(senderId);
    }

    // =====================================================
    // GET CONVERSATION
    // =====================================================

    public List<Message> getConversation(
            Long senderId,
            Long receiverId) {

        if (senderId == null || receiverId == null) {
            throw new RuntimeException(
                    "Sender ID and Receiver ID are required");
        }

        return messageRepository
                .findBySenderIdAndReceiverIdOrderByCreatedAtAsc(
                        senderId,
                        receiverId);
    }

    // =====================================================
    // GET REQUEST MESSAGES
    // =====================================================

    public List<Message> getRequestMessages(Long requestId) {

        if (requestId == null) {
            throw new RuntimeException("Request ID is required");
        }

        return messageRepository
                .findByRequestIdOrderByCreatedAtAsc(requestId);
    }

    // =====================================================
    // MARK MESSAGE AS READ
    // =====================================================

    public Message markAsRead(Long messageId) {

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Message not found: " + messageId));

        message.setRead(true);

        return messageRepository.save(message);
    }

    // =====================================================
    // DELETE MESSAGE
    // =====================================================

    public void deleteMessage(Long messageId) {

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Message not found: " + messageId));

        messageRepository.delete(message);
    }

    // =====================================================
    // DELETE ALL MESSAGES OF REQUEST
    // =====================================================

    @Transactional
    public void deleteMessagesByRequestId(Long requestId) {

        if (requestId == null) {
            throw new RuntimeException("Request ID is required");
        }

        messageRepository.deleteByRequestId(requestId);
    }
}