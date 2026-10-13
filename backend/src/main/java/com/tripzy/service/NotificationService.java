package com.tripzy.service;

import com.tripzy.entity.Notification;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (notification.getUserId().equals(userId)) {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }
        return notification;
    }

    @Transactional
    public Map<String, Object> markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        return res;
    }

    public Notification sendNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        try {
            messagingTemplate.convertAndSend("/topic/user/" + notification.getUserId() + "/notifications", saved);
        } catch (Exception ignored) {}
        return saved;
    }
}
