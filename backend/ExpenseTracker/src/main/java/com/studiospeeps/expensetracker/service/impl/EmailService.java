package com.studiospeeps.expensetracker.service.impl;

import com.studiospeeps.expensetracker.dto.BrevoEmailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${BREVO_API_KEY:NO_KEY}")
    private String apiKey;

    @Value("${BREVO_SENDER_EMAIL:sahilmahajan2804@gmail.com}")
    private String senderEmail;

    @Value("${BREVO_SENDER_NAME:Expense Tracker}")
    private String senderName;

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Async
    public void sendMail(String to, String sub, String body) {
        System.out.println("DEBUG [" + Thread.currentThread().getName() + "]: Attempting to send Brevo email to " + to);

        if ("NO_KEY".equals(apiKey)) {
            System.err.println("CRITICAL ERROR: Brevo API Key is missing! Please set BREVO_API_KEY environment variable.");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            BrevoEmailRequest request = BrevoEmailRequest.builder()
                    .sender(new BrevoEmailRequest.Sender(senderName, senderEmail))
                    .to(Collections.singletonList(new BrevoEmailRequest.To(to, to)))
                    .subject(sub)
                    .htmlContent("<html><body>" + body + "</body></html>")
                    .build();

            HttpEntity<BrevoEmailRequest> entity = new HttpEntity<>(request, headers);

            restTemplate.postForEntity(BREVO_API_URL, entity, String.class);
            System.out.println("DEBUG: Brevo email successfully sent to " + to);

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: Brevo API call failed for " + to);
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
