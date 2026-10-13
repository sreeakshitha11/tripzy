package com.tripzy.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class GroupDtos {

    public static class SendMessageRequest {
        @NotBlank(message = "Content cannot be empty")
        private String content;
        private String messageType = "TEXT";

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }
    }

    public static class CreateAnnouncementRequest {
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Content is required")
        private String content;
        private String priority = "NORMAL";

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class CreatePollRequest {
        @NotBlank(message = "Question is required")
        private String question;
        private List<String> options;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
    }

    public static class VotePollRequest {
        private Long optionId;
        public Long getOptionId() { return optionId; }
        public void setOptionId(Long optionId) { this.optionId = optionId; }
    }
}
