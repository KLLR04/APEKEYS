package com.example.ms_pedidos.controller;

import com.example.ms_pedidos.config.UsuarioAutenticado;
import com.example.ms_pedidos.dto.ActualizarCantidadCarritoRequest;
import com.example.ms_pedidos.dto.AgregarProductoCarritoRequest;
import com.example.ms_pedidos.dto.CarritoResponse;
import com.example.ms_pedidos.service.CarritoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/carritos")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    // consultar mi carrito
    @GetMapping
    public ResponseEntity<CarritoResponse> obtenerMiCarrito(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {

        return ResponseEntity.ok(carritoService.obtenerOCrearCarrito(usuario.email()));
    }

    // agregar producto a mi carrito
    @PostMapping("/productos")
    public ResponseEntity<CarritoResponse> agregarProducto(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestBody AgregarProductoCarritoRequest datos) {

        if (datos == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar producto y cantidad"
            );
        }

        return ResponseEntity.ok(carritoService.agregarProducto(
                usuario.email(),
                datos.productoId(),
                datos.cantidad()
        ));
    }

    // actualizar cantidad de un producto de mi carrito
    @PutMapping("/productos/{productoId}")
    public ResponseEntity<CarritoResponse> actualizarCantidad(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Integer productoId,
            @RequestBody ActualizarCantidadCarritoRequest datos) {

        return ResponseEntity.ok(carritoService.actualizarCantidad(
                usuario.email(),
                productoId,
                datos == null ? null : datos.cantidad()
        ));
    }

    // eliminar un producto de mi carrito
    @DeleteMapping("/productos/{productoId}")
    public ResponseEntity<CarritoResponse> eliminarProducto(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Integer productoId) {

        return ResponseEntity.ok(carritoService.eliminarProducto(usuario.email(), productoId));
    }

    // uso interno: ms catalogo quita de todos los carritos un producto que se elimino
    @DeleteMapping("/interno/producto/{productoId}")
    public ResponseEntity<Void> quitarProductoDeTodos(@PathVariable Integer productoId) {

        carritoService.quitarProductoDeTodos(productoId);

        return ResponseEntity.noContent().build();
    }

    // vaciar mi carrito
    @DeleteMapping
    public ResponseEntity<CarritoResponse> vaciarCarrito(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {

        return ResponseEntity.ok(carritoService.vaciarCarrito(usuario.email()));
    }
}
