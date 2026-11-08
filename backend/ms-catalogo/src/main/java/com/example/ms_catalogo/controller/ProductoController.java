package com.example.ms_catalogo.controller;

import com.example.ms_catalogo.dto.DescontarStockRequest;
import com.example.ms_catalogo.model.Producto;
import com.example.ms_catalogo.service.ProductoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarProductos() {
        return ResponseEntity.ok(productoService.listarProductos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProducto(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.obtenerProducto(id));
    }

    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<Producto>> listarPorCategoria(
            @PathVariable Integer idCategoria) {

        return ResponseEntity.ok(productoService.listarPorCategoria(idCategoria));
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {

        Producto nuevoProducto = productoService.crearProducto(producto);

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Integer id,
            @RequestBody Producto producto) {

        return ResponseEntity.ok(productoService.actualizarProducto(id, producto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Integer id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    // descontar stock desde ms pedidos con la clave interna
    @PostMapping("/{id}/descontar-stock")
    public ResponseEntity<Void> descontarStock(
            @PathVariable Integer id,
            @RequestBody DescontarStockRequest datos) {

        productoService.descontarStock(
                id,
                datos == null ? null : datos.cantidad()
        );

        return ResponseEntity.noContent().build();
    }
}
