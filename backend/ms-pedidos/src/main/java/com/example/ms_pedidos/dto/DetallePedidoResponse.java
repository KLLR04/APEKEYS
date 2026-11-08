package com.example.ms_pedidos.dto;

import java.math.BigDecimal;

public record DetallePedidoResponse(
        Integer productoId,
        String nombreProducto,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {
}
