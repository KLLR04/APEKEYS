package com.example.ms_pedidos.config;

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

@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    // rutas que solo puede llamar ms catalogo al eliminar un producto
    private static final String RUTA_INTERNA = "/api/carritos/interno/";

    private final String internalApiKey;

    public InternalApiKeyFilter(
            @Value("${app.internal.api-key:}") String internalApiKey) {

        this.internalApiKey = internalApiKey;
    }

    // aplicar el filtro solo a las rutas internas
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith(RUTA_INTERNA);
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
