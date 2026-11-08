package com.example.ms_pedidos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PedidoResponse(
        Integer idPedido,
        LocalDate fechaPedido,
        String estado,
        BigDecimal totalAPagar,
        String usuarioEmail,
        List<DetallePedidoResponse> productos
) {
}
