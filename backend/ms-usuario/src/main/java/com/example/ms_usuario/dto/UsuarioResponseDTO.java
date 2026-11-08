package com.example.ms_usuario.dto;

public record UsuarioResponseDTO(
        String email,
        String nombre,
        String apellido,
        Integer idTipoUsuario,
        String rol
) {
}
