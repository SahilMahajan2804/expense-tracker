package com.studiospeeps.expensetracker.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {
    private Long attachmentId;
    private String fileName;
    private String filePath;
    private LocalDateTime uploadedAt;
}