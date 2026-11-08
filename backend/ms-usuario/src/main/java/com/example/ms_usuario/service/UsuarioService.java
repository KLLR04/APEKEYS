package com.example.ms_usuario.service;

import com.example.ms_usuario.config.DataInitializer;
import com.example.ms_usuario.dto.PerfilActualizarDTO;
import com.example.ms_usuario.dto.UsuarioActualizarDTO;
import com.example.ms_usuario.dto.UsuarioRegistroDTO;
import com.example.ms_usuario.model.TipoUsuario;
import com.example.ms_usuario.model.Usuario;
import com.example.ms_usuario.repository.TipoUsuarioRepository;
import com.example.ms_usuario.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class UsuarioService {

    // mismas reglas que el frontend: entre 4 y 10 caracteres
    static final int LARGO_MINIMO_PASSWORD = 4;
    static final int LARGO_MAXIMO_PASSWORD = 10;

    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            TipoUsuarioRepository tipoUsuarioRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.tipoUsuarioRepository = tipoUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // listar usuarios
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    // buscar usuario por email
    public Usuario buscarPorEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar un correo"
            );
        }

        return usuarioRepository.findById(normalizarEmail(email))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                ));
    }

    // registrar un usuario nuevo con rol cliente
    public Usuario registrar(UsuarioRegistroDTO datos) {

        if (datos == null
                || datos.email() == null || datos.email().isBlank()
                || datos.password() == null || datos.password().isBlank()
                || datos.nombre() == null || datos.nombre().isBlank()
                || datos.apellido() == null || datos.apellido().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe completar todos los campos"
            );
        }

        String email = normalizarEmail(datos.email());

        validarEmail(email);
        validarPassword(datos.password());
        validarNombreApellido(datos.nombre(), datos.apellido());

        if (usuarioRepository.existsById(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo ya está registrado"
            );
        }

        TipoUsuario tipoCliente = tipoUsuarioRepository
                .findByDescripcionIgnoreCase(DataInitializer.ROL_CLIENTE)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "No existe el tipo de usuario Cliente"
                ));

        Usuario usuario = new Usuario();

        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(datos.password()));
        usuario.setNombre(datos.nombre().trim());
        usuario.setApellido(datos.apellido().trim());
        usuario.setTipoUsuario(tipoCliente);

        return usuarioRepository.save(usuario);
    }

    // actualizar nombre apellido y tipo de un usuario como administrador
    public Usuario actualizar(String email, UsuarioActualizarDTO datos, String emailSesion) {

        Usuario usuario = buscarPorEmail(email);

        if (datos == null
                || datos.nombre() == null || datos.nombre().isBlank()
                || datos.apellido() == null || datos.apellido().isBlank()
                || datos.idTipoUsuario() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe completar todos los campos"
            );
        }

        validarNombreApellido(datos.nombre(), datos.apellido());

        TipoUsuario tipoUsuario = tipoUsuarioRepository
                .findById(datos.idTipoUsuario())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El tipo de usuario indicado no existe"
                ));

        // un administrador no puede quitarse su propio rol y dejar el sistema sin acceso
        if (esMismoUsuario(usuario.getEmail(), emailSesion)
                && !DataInitializer.ROL_ADMINISTRADOR.equalsIgnoreCase(tipoUsuario.getDescripcion())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No puedes quitarte tu propio rol de administrador"
            );
        }

        usuario.setNombre(datos.nombre().trim());
        usuario.setApellido(datos.apellido().trim());
        usuario.setTipoUsuario(tipoUsuario);

        return usuarioRepository.save(usuario);
    }

    // actualizar el perfil del usuario autenticado
    public Usuario actualizarPerfil(String email, PerfilActualizarDTO datos) {

        Usuario usuario = buscarPorEmail(email);

        if (datos == null
                || datos.nombre() == null || datos.nombre().isBlank()
                || datos.apellido() == null || datos.apellido().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar nombre y apellido"
            );
        }

        validarNombreApellido(datos.nombre(), datos.apellido());

        usuario.setNombre(datos.nombre().trim());
        usuario.setApellido(datos.apellido().trim());

        // cambiar la contrasena solo si viene informada
        if (datos.password() != null && !datos.password().isBlank()) {
            validarPassword(datos.password());
            usuario.setPassword(passwordEncoder.encode(datos.password()));
        }

        return usuarioRepository.save(usuario);
    }

    // eliminar usuario por email
    public void eliminar(String email, String emailSesion) {

        Usuario usuario = buscarPorEmail(email);

        // un administrador no puede eliminar su propia cuenta
        if (esMismoUsuario(usuario.getEmail(), emailSesion)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No puedes eliminar tu propia cuenta"
            );
        }

        usuarioRepository.delete(usuario);
    }

    private boolean esMismoUsuario(String email, String emailSesion) {
        return emailSesion != null && normalizarEmail(emailSesion).equals(normalizarEmail(email));
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validarEmail(String email) {

        if (email.length() > 100
                || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo no es valido"
            );
        }
    }

    private void validarPassword(String password) {

        if (password.length() < LARGO_MINIMO_PASSWORD
                || password.length() > LARGO_MAXIMO_PASSWORD) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contraseña debe tener entre 4 y 10 caracteres"
            );
        }
    }

    private void validarNombreApellido(String nombre, String apellido) {

        if (nombre.trim().length() > 30 || apellido.trim().length() > 30) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre y el apellido no pueden superar 30 caracteres"
            );
        }
    }
}
