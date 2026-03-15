package com.studiospeeps.expensetracker.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrevoEmailRequest {
    private Sender sender;
    private List<To> to;
    private String subject;
    private String htmlContent;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Sender {
        private String name;
        private String email;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class To {
        private String email;
        private String name;
    }
}
