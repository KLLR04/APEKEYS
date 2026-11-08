package com.example.ms_usuario.dto;

public record UsuarioActualizarDTO(
        String nombre,
        String apellido,
        Integer idTipoUsuario
) {
}
