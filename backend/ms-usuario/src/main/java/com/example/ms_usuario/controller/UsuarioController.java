package com.example.ms_usuario.controller;

import com.example.ms_usuario.dto.PerfilActualizarDTO;
import com.example.ms_usuario.dto.UsuarioActualizarDTO;
import com.example.ms_usuario.dto.UsuarioRegistroDTO;
import com.example.ms_usuario.dto.UsuarioResponseDTO;
import com.example.ms_usuario.model.Usuario;
import com.example.ms_usuario.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // listar usuarios como administrador
    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listar()
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    // consultar el perfil del usuario autenticado
    @GetMapping("/perfil")
    public UsuarioResponseDTO obtenerPerfil(
            @AuthenticationPrincipal String email) {

        return convertirDTO(usuarioService.buscarPorEmail(email));
    }

    // actualizar el perfil del usuario autenticado
    @PutMapping("/perfil")
    public UsuarioResponseDTO actualizarPerfil(
            @AuthenticationPrincipal String email,
            @RequestBody PerfilActualizarDTO datos) {

        return convertirDTO(usuarioService.actualizarPerfil(email, datos));
    }

    // buscar usuario por email como administrador
    @GetMapping("/{email}")
    public UsuarioResponseDTO buscarPorEmail(@PathVariable String email) {
        return convertirDTO(usuarioService.buscarPorEmail(email));
    }

    // registrar usuario nuevo
    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO registrar(
            @RequestBody UsuarioRegistroDTO datos) {

        Usuario usuario = usuarioService.registrar(datos);

        return convertirDTO(usuario);
    }

    // actualizar usuario como administrador
    @PutMapping("/{email}")
    public UsuarioResponseDTO actualizar(
            @PathVariable String email,
            @RequestBody UsuarioActualizarDTO datos,
            @AuthenticationPrincipal String emailSesion) {

        return convertirDTO(usuarioService.actualizar(email, datos, emailSesion));
    }

    // eliminar usuario como administrador
    @DeleteMapping("/{email}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(
            @PathVariable String email,
            @AuthenticationPrincipal String emailSesion) {

        usuarioService.eliminar(email, emailSesion);
    }

    // convertir entidad a dto sin exponer la contrasena
    private UsuarioResponseDTO convertirDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getTipoUsuario().getIdTipoUsuario(),
                usuario.getTipoUsuario().getDescripcion()
        );
    }
}
