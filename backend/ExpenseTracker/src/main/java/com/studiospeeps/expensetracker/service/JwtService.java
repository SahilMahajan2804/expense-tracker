package com.studiospeeps.expensetracker.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final String secretKey = "zr4gh651dzt4c62sd5tb46cts5z4b62a541tb6c25d41bv654vgt65zd14v62t541v6azx41r63hjgbnavgHCTFBHGCyvhyV065461x54c65x4c265e341cv635e41v2xc12cx6";

    Map<String, Object> claims = new HashMap<>();

    public String generateToken(String email) {

        return Jwts
                .builder()
                .claims()
                .add(claims)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000L)) // 24 hours
                .and()
                .signWith(getTokenKey())
                .compact();

    }

    public SecretKey getTokenKey(){
        byte[] bytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(bytes);
    }

    // ===============================
    // 1️⃣ Extract username (subject)
    // ===============================
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ===============================
    // 2️⃣ Extract any claim
    // ===============================
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    // ===============================
    // 3️⃣ Validate token
    // ===============================
    public boolean validateToken(String token, String email) {
        final String tokenEmail = extractEmail(token);
        return tokenEmail.equals(email) && !isTokenExpired(token);
    }

    // ===============================
    // 4️⃣ Check expiry
    // ===============================
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // ===============================
    // 5️⃣ Parse JWT
    // ===============================
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getTokenKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
