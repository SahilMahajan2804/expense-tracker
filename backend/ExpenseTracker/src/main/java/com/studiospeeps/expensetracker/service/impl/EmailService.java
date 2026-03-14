package com.studiospeeps.expensetracker.service.impl;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    @Autowired
    private final JavaMailSender javaMailSender;

    public void sendMail(String to, String sub, String body) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(sub);
            helper.setText(body,true);
            javaMailSender.send(message);
        }catch (Exception e){
            System.err.println("FAILED TO SEND EMAIL to " + to + ": " + e.getMessage());
            e.printStackTrace();
            // We log the error but don't throw to prevent blocking the registration flow in dev
        }
    }
}
