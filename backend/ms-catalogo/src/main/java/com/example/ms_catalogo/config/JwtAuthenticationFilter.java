package com.example.ms_catalogo.config;

import com.example.ms_catalogo.service.JwtService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization != null
                && authorization.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String token = authorization.substring(7);

            try {
                Claims claims = jwtService.obtenerClaims(token);

                String email = claims.getSubject();
                String rol = claims.get("rol", String.class);

                if (email != null && !email.isBlank()
                        && rol != null && !rol.isBlank()) {

                    // armar la autoridad con el prefijo role
                    String rolNormalizado = rol.trim().toUpperCase(Locale.ROOT);

                    String autoridad = rolNormalizado.startsWith("ROLE_")
                            ? rolNormalizado
                            : "ROLE_" + rolNormalizado;

                    UsernamePasswordAuthenticationToken autenticacion =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    List.of(new SimpleGrantedAuthority(autoridad))
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(autenticacion);
                }

            } catch (io.jsonwebtoken.JwtException
                     | IllegalArgumentException e) {

                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
