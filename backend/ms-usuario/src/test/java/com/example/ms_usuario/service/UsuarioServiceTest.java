package com.example.ms_usuario.service;

import com.example.ms_usuario.dto.UsuarioActualizarDTO;
import com.example.ms_usuario.dto.UsuarioRegistroDTO;
import com.example.ms_usuario.model.TipoUsuario;
import com.example.ms_usuario.model.Usuario;
import com.example.ms_usuario.repository.TipoUsuarioRepository;
import com.example.ms_usuario.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// pruebas unitarias: los repositorios son "dobles" (mocks), no se usa la base de datos
class UsuarioServiceTest {

    private UsuarioRepository usuarioRepository;
    private TipoUsuarioRepository tipoUsuarioRepository;
    private UsuarioService service;

    private final TipoUsuario admin = tipo(1, "ADMINISTRADOR");
    private final TipoUsuario cliente = tipo(2, "CLIENTE");

    @BeforeEach
    void preparar() {
        usuarioRepository = mock(UsuarioRepository.class);
        tipoUsuarioRepository = mock(TipoUsuarioRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode(any())).thenReturn("cifrada");
        when(usuarioRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(tipoUsuarioRepository.findByDescripcionIgnoreCase("CLIENTE")).thenReturn(Optional.of(cliente));
        service = new UsuarioService(usuarioRepository, tipoUsuarioRepository, encoder);
    }

    @Test
    void registraConContrasenaDe4a10Caracteres() {
        assertEquals("ana@gmail.com",
                service.registrar(new UsuarioRegistroDTO("Ana@Gmail.com", "1234", "Ana", "Pérez")).getEmail());
        assertNotNull(service.registrar(new UsuarioRegistroDTO("bea@gmail.com", "1234567890", "Bea", "Soto")));
    }

    @Test
    void rechazaContrasenaMuyCortaOMuyLarga() {
        ResponseStatusException corta = assertThrows(ResponseStatusException.class,
                () -> service.registrar(new UsuarioRegistroDTO("ana@gmail.com", "123", "Ana", "Pérez")));
        ResponseStatusException larga = assertThrows(ResponseStatusException.class,
                () -> service.registrar(new UsuarioRegistroDTO("ana@gmail.com", "12345678901", "Ana", "Pérez")));

        assertEquals(HttpStatus.BAD_REQUEST, corta.getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, larga.getStatusCode());
    }

    @Test
    void adminNoPuedeEliminarSuPropiaCuenta() {
        when(usuarioRepository.findById("admin@fullstack.cl")).thenReturn(Optional.of(usuario("admin@fullstack.cl", admin)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.eliminar("ADMIN@fullstack.cl", "admin@fullstack.cl"));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void adminPuedeEliminarAOtroUsuario() {
        Usuario otro = usuario("ana@gmail.com", cliente);
        when(usuarioRepository.findById("ana@gmail.com")).thenReturn(Optional.of(otro));

        service.eliminar("ana@gmail.com", "admin@fullstack.cl");

        verify(usuarioRepository).delete(otro);
    }

    @Test
    void adminNoPuedeQuitarseSuPropioRol() {
        when(usuarioRepository.findById("admin@fullstack.cl")).thenReturn(Optional.of(usuario("admin@fullstack.cl", admin)));
        when(tipoUsuarioRepository.findById(2)).thenReturn(Optional.of(cliente));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.actualizar("admin@fullstack.cl", new UsuarioActualizarDTO("Admin", "Sistema", 2), "admin@fullstack.cl"));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    }

    private static TipoUsuario tipo(int id, String descripcion) {
        TipoUsuario tipo = new TipoUsuario();
        tipo.setIdTipoUsuario(id);
        tipo.setDescripcion(descripcion);
        return tipo;
    }

    private static Usuario usuario(String email, TipoUsuario tipo) {
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setNombre("N");
        usuario.setApellido("A");
        usuario.setTipoUsuario(tipo);
        return usuario;
    }
}
