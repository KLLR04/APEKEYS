package com.example.ms_usuario.service;

import com.example.ms_usuario.dto.LoginRequestDTO;
import com.example.ms_usuario.dto.LoginResponseDTO;
import com.example.ms_usuario.model.Usuario;
import com.example.ms_usuario.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // validar credenciales y devolver el token
    public LoginResponseDTO login(LoginRequestDTO datos) {

        if (datos == null
                || datos.email() == null
                || datos.email().isBlank()
                || datos.password() == null
                || datos.password().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe ingresar correo y contraseña"
            );
        }

        String email = datos.email().trim().toLowerCase(Locale.ROOT);

        Usuario usuario = usuarioRepository
                .findById(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Credenciales incorrectas"
                ));

        if (!passwordEncoder.matches(
                datos.password(),
                usuario.getPassword())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciales incorrectas"
            );
        }

        String rol = usuario.getTipoUsuario()
                .getDescripcion()
                .trim()
                .toUpperCase(Locale.ROOT);

        String token = jwtService.generarToken(
                usuario.getEmail(),
                rol
        );

        return new LoginResponseDTO(
                token,
                "Bearer",
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                rol
        );
    }
}
