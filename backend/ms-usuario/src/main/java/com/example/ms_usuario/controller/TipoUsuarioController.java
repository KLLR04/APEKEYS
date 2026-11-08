package com.example.ms_usuario.controller;

import com.example.ms_usuario.model.TipoUsuario;
import com.example.ms_usuario.service.TipoUsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-usuario")
public class TipoUsuarioController {

    private final TipoUsuarioService tipoUsuarioService;

    public TipoUsuarioController(TipoUsuarioService tipoUsuarioService) {
        this.tipoUsuarioService = tipoUsuarioService;
    }

    @GetMapping
    public List<TipoUsuario> listar() {
        return tipoUsuarioService.listar();
    }

    @GetMapping("/{id}")
    public TipoUsuario buscarPorId(@PathVariable Integer id) {
        return tipoUsuarioService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TipoUsuario guardar(@RequestBody TipoUsuario tipoUsuario) {
        return tipoUsuarioService.guardar(tipoUsuario);
    }

    @PutMapping("/{id}")
    public TipoUsuario actualizar(
            @PathVariable Integer id,
            @RequestBody TipoUsuario tipoUsuario) {
        return tipoUsuarioService.actualizar(id, tipoUsuario);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Integer id) {
        tipoUsuarioService.eliminar(id);
    }
}
