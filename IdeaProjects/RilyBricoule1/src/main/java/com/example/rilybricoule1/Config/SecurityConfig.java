package com.example.rilybricoule1.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    @Bean
    UserDetailsService users() {
        return new InMemoryUserDetailsManager(
                User.withUsername("soufyane@gmail.com")
                        .password("{noop}123")  // plain password
                        .roles("ADMIN")          // just "ADMIN"
                        .build()
        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())       // REST → no CSRF
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated()   // ALL endpoints require auth
                )
                .httpBasic(basic -> {});                       // ✅ enable HTTP Basic
        // formLogin can stay disabled if you want
        return http.build();
    }
}










