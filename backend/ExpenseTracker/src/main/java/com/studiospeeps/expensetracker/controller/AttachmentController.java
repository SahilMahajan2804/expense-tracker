package com.studiospeeps.expensetracker.controller;

import com.studiospeeps.expensetracker.dto.AttachmentResponse;
import com.studiospeeps.expensetracker.service.impl.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "${ALLOWED_ORIGINS}")
@RequiredArgsConstructor
public class AttachmentController {

    private final FileStorageService fileStorageService;

    // ==================== UPLOAD SINGLE FILE ====================
    @PostMapping("/expense/{expenseId}")
    public ResponseEntity<?> uploadAttachment(
            Authentication authentication,
            @PathVariable Long expenseId,
            @RequestParam("file") MultipartFile file) {
        try {
            AttachmentResponse attachment = fileStorageService.uploadFile(
                    expenseId, file, authentication.getName(), isAdmin(authentication));
            return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== UPLOAD MULTIPLE FILES ====================
    @PostMapping("/expense/{expenseId}/multiple")
    public ResponseEntity<?> uploadMultipleAttachments(
            Authentication authentication,
            @PathVariable Long expenseId,
            @RequestParam("files") MultipartFile[] files) {
        try {
            List<AttachmentResponse> attachments = new ArrayList<>();
            for (MultipartFile file : files) {
                AttachmentResponse attachment = fileStorageService.uploadFile(
                    expenseId, file, authentication.getName(), isAdmin(authentication));
                attachments.add(attachment);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(attachments);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload files: " + e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== GET ATTACHMENTS BY EXPENSE ====================
    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<?> getAttachmentsByExpense(Authentication authentication, @PathVariable Long expenseId) {
        try {
            List<AttachmentResponse> attachments = fileStorageService.getAttachmentsByExpense(
                    expenseId, authentication.getName(), isAdmin(authentication));
            return ResponseEntity.ok(attachments);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== DOWNLOAD FILE ====================
    @GetMapping("/download/{attachmentId}")
    public ResponseEntity<?> downloadAttachment(Authentication authentication, @PathVariable Long attachmentId) {
        try {
            Resource resource = fileStorageService.downloadFile(
                    attachmentId, authentication.getName(), isAdmin(authentication));
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== DELETE ATTACHMENT ====================
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(Authentication authentication, @PathVariable Long attachmentId) {
        try {
            fileStorageService.deleteAttachment(attachmentId, authentication.getName(), isAdmin(authentication));
            return ResponseEntity.ok("Attachment deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}