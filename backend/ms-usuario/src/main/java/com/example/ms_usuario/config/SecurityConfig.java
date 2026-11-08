package com.example.ms_usuario.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                    .sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(
                            (request, response, authException) ->
                                    response.sendError(
                                            HttpStatus.UNAUTHORIZED.value(),
                                            "No autenticado"
                                    )
                    )
                    .accessDeniedHandler(
                            (request, response, accessDeniedException) ->
                                    response.sendError(
                                            HttpStatus.FORBIDDEN.value(),
                                            "Acceso denegado"
                                    )
                    )
            )
            .authorizeHttpRequests(auth -> auth

                // permitir la ruta de error
                .requestMatchers("/error").permitAll()

                // permitir registro y login sin token
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/usuarios/registro",
                    "/api/auth/login"
                ).permitAll()

                // permitir consultar tipos de usuario sin token
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/tipos-usuario",
                    "/api/tipos-usuario/**"
                ).permitAll()

                // permitir al usuario autenticado ver y editar su perfil
                .requestMatchers(
                    "/api/usuarios/perfil"
                ).authenticated()

                // restringir la administracion de usuarios al administrador
                .requestMatchers(
                    "/api/usuarios",
                    "/api/usuarios/**"
                ).hasRole("ADMINISTRADOR")

                // restringir la escritura de tipos de usuario al administrador
                .requestMatchers(
                    "/api/tipos-usuario",
                    "/api/tipos-usuario/**"
                ).hasRole("ADMINISTRADOR")

                .anyRequest().authenticated()
            )
            .addFilterBefore(
                    jwtFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
