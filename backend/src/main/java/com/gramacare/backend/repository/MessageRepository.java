package com.gramacare.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gramacare.backend.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Messages received by a customer/provider
    List<Message> findByReceiverIdOrderByCreatedAtAsc(Long receiverId);

    // Messages sent by a customer/provider
    List<Message> findBySenderIdOrderByCreatedAtAsc(Long senderId);

    // Conversation between two users
    List<Message> findBySenderIdAndReceiverIdOrderByCreatedAtAsc(
            Long senderId,
            Long receiverId
    );

    // Messages related to a particular service request
    List<Message> findByRequestIdOrderByCreatedAtAsc(Long requestId);

    // Delete messages related to a request
    void deleteByRequestId(Long requestId);
}