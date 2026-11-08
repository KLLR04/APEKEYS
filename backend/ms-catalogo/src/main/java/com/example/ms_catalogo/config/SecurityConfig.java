package com.example.ms_catalogo.config;

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
            JwtAuthenticationFilter jwtFilter,
            InternalApiKeyFilter internalApiKeyFilter
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
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

                    // permitir descontar stock solo entre microservicios
                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/productos/*/descontar-stock"
                    ).hasRole("SERVICIO_INTERNO")

                    // permitir consultas publicas del catalogo
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/categorias",
                            "/api/categorias/**",
                            "/api/productos",
                            "/api/productos/**"
                    ).permitAll()

                    // restringir la escritura del catalogo al administrador
                    .requestMatchers(
                            "/api/categorias",
                            "/api/categorias/**",
                            "/api/productos",
                            "/api/productos/**"
                    ).hasRole("ADMINISTRADOR")

                    .anyRequest().authenticated()
            )
            .addFilterBefore(
                    jwtFilter,
                    UsernamePasswordAuthenticationFilter.class
            )
            .addFilterBefore(
                    internalApiKeyFilter,
                    JwtAuthenticationFilter.class
            );

        return http.build();
    }
}
