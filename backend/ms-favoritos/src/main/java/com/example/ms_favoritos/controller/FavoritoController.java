package com.example.ms_favoritos.controller;

import com.example.ms_favoritos.config.UsuarioAutenticado;
import com.example.ms_favoritos.dto.FavoritoEstadoResponse;
import com.example.ms_favoritos.dto.FavoritoResponse;
import com.example.ms_favoritos.service.FavoritoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    // listar mis favoritos
    @GetMapping
    public ResponseEntity<List<FavoritoResponse>> listarMisFavoritos(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {

        return ResponseEntity.ok(favoritoService.listarMisFavoritos(usuario.email()));
    }

    // consultar si un producto es favorito
    @GetMapping("/{productoId}")
    public ResponseEntity<FavoritoEstadoResponse> consultarFavorito(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Integer productoId) {

        return ResponseEntity.ok(favoritoService.consultarFavorito(usuario.email(), productoId));
    }

    // agregar producto a favoritos
    @PostMapping("/{productoId}")
    public ResponseEntity<FavoritoResponse> agregarFavorito(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Integer productoId) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(favoritoService.agregarFavorito(usuario.email(), productoId));
    }

    // quitar producto de favoritos
    // uso interno: ms catalogo borra los favoritos de un producto que se elimino
    @DeleteMapping("/interno/producto/{productoId}")
    public ResponseEntity<Void> eliminarFavoritosDeProducto(@PathVariable Integer productoId) {

        favoritoService.eliminarFavoritosDeProducto(productoId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productoId}")
    public ResponseEntity<Void> eliminarFavorito(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Integer productoId) {

        favoritoService.eliminarFavorito(usuario.email(), productoId);

        return ResponseEntity.noContent().build();
    }
}
