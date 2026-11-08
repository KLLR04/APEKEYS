package com.example.ms_catalogo.controller;

import com.example.ms_catalogo.dto.LineaStock;
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

    // descontar el stock de un pedido completo desde ms pedidos con la clave interna
    // se descuentan todas las lineas o ninguna
    @PostMapping("/descontar-stock")
    public ResponseEntity<Void> descontarStock(@RequestBody List<LineaStock> lineas) {

        productoService.descontarStock(lineas);

        return ResponseEntity.noContent().build();
    }

    // devolver stock si ms pedidos no pudo guardar el pedido
    @PostMapping("/reponer-stock")
    public ResponseEntity<Void> reponerStock(@RequestBody List<LineaStock> lineas) {

        productoService.reponerStock(lineas);

        return ResponseEntity.noContent().build();
    }
}
