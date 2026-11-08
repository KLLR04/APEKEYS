package com.example.ms_pedidos.config;

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
            InternalApiKeyFilter internalApiKeyFilter) throws Exception {

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
                    // permitir a ms catalogo limpiar referencias de productos eliminados
                    .requestMatchers(HttpMethod.DELETE, "/api/carritos/interno/**")
                            .hasRole("SERVICIO_INTERNO")

                    // restringir la gestion de todos los pedidos al administrador
                    .requestMatchers("/api/pedidos/admin", "/api/pedidos/admin/**")
                            .hasRole("ADMINISTRADOR")

                    .requestMatchers(HttpMethod.PUT, "/api/pedidos/*/estado")
                            .hasRole("ADMINISTRADOR")

                    // permitir carrito y pedidos propios a cualquier usuario autenticado
                    .requestMatchers(
                            "/api/carritos",
                            "/api/carritos/**",
                            "/api/pedidos",
                            "/api/pedidos/**"
                    ).authenticated()

                    .anyRequest().denyAll()
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
