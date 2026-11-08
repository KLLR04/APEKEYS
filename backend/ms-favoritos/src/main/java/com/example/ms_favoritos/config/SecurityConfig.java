package com.example.ms_favoritos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(
                            (request, response, exception) ->
                                    response.sendError(
                                            HttpStatus.UNAUTHORIZED.value(),
                                            "No autenticado"
                                    )
                    )
                    .accessDeniedHandler(
                            (request, response, exception) ->
                                    response.sendError(
                                            HttpStatus.FORBIDDEN.value(),
                                            "Acceso denegado"
                                    )
                    )
            )
            .authorizeHttpRequests(auth -> auth

                    // permitir la ruta de error
                    .requestMatchers("/error").permitAll()

                    // permitir favoritos propios a cualquier usuario autenticado
                    .requestMatchers(
                            "/api/favoritos",
                            "/api/favoritos/**"
                    ).authenticated()

                    .anyRequest().denyAll()
            )
            .addFilterBefore(
                    jwtFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
