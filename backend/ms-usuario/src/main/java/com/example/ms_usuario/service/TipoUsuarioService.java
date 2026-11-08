package com.example.ms_usuario.service;

import com.example.ms_usuario.model.TipoUsuario;
import com.example.ms_usuario.repository.TipoUsuarioRepository;
import com.example.ms_usuario.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class TipoUsuarioService {

    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final UsuarioRepository usuarioRepository;

    public TipoUsuarioService(
            TipoUsuarioRepository tipoUsuarioRepository,
            UsuarioRepository usuarioRepository) {

        this.tipoUsuarioRepository = tipoUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // listar tipos de usuario
    public List<TipoUsuario> listar() {
        return tipoUsuarioRepository.findAll();
    }

    // buscar tipo de usuario por id
    public TipoUsuario buscarPorId(Integer id) {
        return tipoUsuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tipo de usuario no encontrado"
                ));
    }

    // crear tipo de usuario
    public TipoUsuario guardar(TipoUsuario tipoUsuario) {

        validarDescripcion(tipoUsuario);

        tipoUsuario.setIdTipoUsuario(null);
        tipoUsuario.setDescripcion(normalizar(tipoUsuario.getDescripcion()));

        return tipoUsuarioRepository.save(tipoUsuario);
    }

    // actualizar tipo de usuario
    public TipoUsuario actualizar(Integer id, TipoUsuario datos) {

        TipoUsuario existente = buscarPorId(id);

        validarDescripcion(datos);

        existente.setDescripcion(normalizar(datos.getDescripcion()));

        return tipoUsuarioRepository.save(existente);
    }

    // eliminar tipo de usuario si ningun usuario lo usa
    public void eliminar(Integer id) {

        TipoUsuario existente = buscarPorId(id);

        if (usuarioRepository.existsByTipoUsuario_IdTipoUsuario(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar un tipo de usuario asignado a usuarios"
            );
        }

        tipoUsuarioRepository.delete(existente);
    }

    private void validarDescripcion(TipoUsuario tipoUsuario) {

        if (tipoUsuario == null
                || tipoUsuario.getDescripcion() == null
                || tipoUsuario.getDescripcion().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar una descripcion"
            );
        }

        if (tipoUsuario.getDescripcion().trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La descripcion no puede superar 100 caracteres"
            );
        }
    }

    // guardar la descripcion en mayuscula para usarla como rol
    private String normalizar(String descripcion) {
        return descripcion.trim().toUpperCase(Locale.ROOT);
    }
}
