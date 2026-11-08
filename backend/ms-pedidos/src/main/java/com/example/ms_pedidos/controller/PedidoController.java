package com.example.ms_pedidos.controller;

import com.example.ms_pedidos.config.UsuarioAutenticado;
import com.example.ms_pedidos.dto.ActualizarEstadoPedidoRequest;
import com.example.ms_pedidos.dto.PedidoResponse;
import com.example.ms_pedidos.service.PedidoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // crear pedido desde mi carrito
    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pedidoService.crearPedido(usuario.email()));
    }

    // consultar historial de mis pedidos
    @GetMapping
    public ResponseEntity<List<PedidoResponse>> obtenerMisPedidos(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {

        return ResponseEntity.ok(pedidoService.obtenerMisPedidos(usuario.email()));
    }

    // consultar uno de mis pedidos por id
    @GetMapping("/{idPedido}")
    public ResponseEntity<PedidoResponse> obtenerPedidoPorId(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Integer idPedido) {

        return ResponseEntity.ok(pedidoService.obtenerPedidoPorId(usuario.email(), idPedido));
    }

    // listar todos los pedidos como administrador
    @GetMapping("/admin")
    public ResponseEntity<List<PedidoResponse>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    // cambiar estado de un pedido como administrador
    @PutMapping("/{idPedido}/estado")
    public ResponseEntity<PedidoResponse> actualizarEstado(
            @PathVariable Integer idPedido,
            @RequestBody ActualizarEstadoPedidoRequest datos) {

        return ResponseEntity.ok(pedidoService.actualizarEstado(
                idPedido,
                datos == null ? null : datos.estado()
        ));
    }
}
