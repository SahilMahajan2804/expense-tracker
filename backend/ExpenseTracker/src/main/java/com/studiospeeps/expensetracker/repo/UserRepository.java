package com.studiospeeps.expensetracker.repo;

import com.studiospeeps.expensetracker.entity.Users;
import com.studiospeeps.expensetracker.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Users findByEmail(String email);
    boolean existsByEmail(String email);
    List<Users> findByRole(Role role);
    Optional<Users> findByEmailAndOtp(String email, String otp);
}