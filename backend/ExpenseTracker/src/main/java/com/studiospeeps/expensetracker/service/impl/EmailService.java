package com.studiospeeps.expensetracker.service.impl;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    @Autowired
    private final JavaMailSender javaMailSender;

    @Async
    public void sendMail(String to, String sub, String body) {
        System.out.println("DEBUG [" + Thread.currentThread().getName() + "]: Attempting to send email to " + to + " with subject: " + sub);
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(sub);
            helper.setText(body, true);
            
            javaMailSender.send(message);
            System.out.println("DEBUG: Email successfully sent to " + to);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: FAILED TO SEND EMAIL to " + to);
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
