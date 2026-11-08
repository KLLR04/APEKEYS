package com.example.ms_usuario.dto;

public record LoginResponseDTO(
        String token,
        String tipo,
        String email,
        String nombre,
        String apellido,
        String rol
) {
}
