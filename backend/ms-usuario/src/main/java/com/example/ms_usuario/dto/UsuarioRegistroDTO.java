package com.example.ms_usuario.dto;

public record UsuarioRegistroDTO(
        String email,
        String password,
        String nombre,
        String apellido
) {
}
