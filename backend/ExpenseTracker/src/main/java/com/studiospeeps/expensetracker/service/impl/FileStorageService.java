package com.studiospeeps.expensetracker.service.impl;

import com.studiospeeps.expensetracker.dto.AttachmentResponse;
import com.studiospeeps.expensetracker.entity.Expense;
import com.studiospeeps.expensetracker.entity.ExpenseAttachment;
import com.studiospeeps.expensetracker.repo.ExpenseAttachmentRepository;
import com.studiospeeps.expensetracker.repo.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final ExpenseAttachmentRepository attachmentRepository;
    private final ExpenseRepository expenseRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public AttachmentResponse uploadFile(Long expenseId, MultipartFile file, String email, boolean isAdmin)
            throws IOException {
        Expense expense = findAuthorizedExpense(expenseId, email, isAdmin);

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save attachment record
        ExpenseAttachment attachment = ExpenseAttachment.builder()
                .expense(expense)
                .fileName(originalFilename)
                .filePath(newFilename)
                .uploadedAt(LocalDateTime.now())
                .build();

        ExpenseAttachment savedAttachment = attachmentRepository.save(attachment);

        return mapToResponse(savedAttachment);
    }

    public List<AttachmentResponse> getAttachmentsByExpense(Long expenseId, String email, boolean isAdmin) {
        Expense expense = findAuthorizedExpense(expenseId, email, isAdmin);

        return attachmentRepository.findByExpense(expense).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Resource downloadFile(Long attachmentId, String email, boolean isAdmin) throws MalformedURLException {
        ExpenseAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        ensureCanAccess(attachment.getExpense(), email, isAdmin);

        Path filePath = Paths.get(uploadDir).resolve(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("File not found or not readable");
        }
    }

    public void deleteAttachment(Long attachmentId, String email, boolean isAdmin) throws IOException {
        ExpenseAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        ensureCanAccess(attachment.getExpense(), email, isAdmin);

        // Delete file from storage
        Path filePath = Paths.get(uploadDir).resolve(attachment.getFilePath());
        Files.deleteIfExists(filePath);

        // Delete record
        attachmentRepository.delete(attachment);
    }

    private Expense findAuthorizedExpense(Long expenseId, String email, boolean isAdmin) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        ensureCanAccess(expense, email, isAdmin);
        return expense;
    }

    private void ensureCanAccess(Expense expense, String email, boolean isAdmin) {
        if (!isAdmin && !expense.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You can only access attachments for your own expenses");
        }
    }

    private AttachmentResponse mapToResponse(ExpenseAttachment attachment) {
        return AttachmentResponse.builder()
                .attachmentId(attachment.getAttachmentId())
                .fileName(attachment.getFileName())
                .filePath(attachment.getFilePath())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}