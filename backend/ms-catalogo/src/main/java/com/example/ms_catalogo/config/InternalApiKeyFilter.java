package com.example.ms_catalogo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Set;

@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    // rutas que solo pueden llamar otros microservicios
    private static final Set<String> RUTAS_INTERNAS = Set.of(
            "/api/productos/descontar-stock",
            "/api/productos/reponer-stock"
    );

    private final String internalApiKey;

    public InternalApiKeyFilter(
            @Value("${app.internal.api-key:}") String internalApiKey) {

        this.internalApiKey = internalApiKey;
    }

    // aplicar el filtro solo a las rutas internas de stock
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return !(
                "POST".equalsIgnoreCase(request.getMethod())
                && RUTAS_INTERNAS.contains(path)
        );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String providedKey = request.getHeader("X-Internal-Api-Key");

        // comparar la clave en tiempo constante para evitar ataques de tiempo
        if (internalApiKey.isBlank()
                || providedKey == null
                || !MessageDigest.isEqual(
                        internalApiKey.getBytes(StandardCharsets.UTF_8),
                        providedKey.getBytes(StandardCharsets.UTF_8)
                )) {

            SecurityContextHolder.clearContext();

            response.sendError(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Credencial interna invalida"
            );

            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        "servicio-interno",
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_SERVICIO_INTERNO"))
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
