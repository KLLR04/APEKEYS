package com.example.ms_pedidos.service;

import com.example.ms_pedidos.dto.LineaStock;
import com.example.ms_pedidos.dto.PedidoResponse;
import com.example.ms_pedidos.dto.ProductoCatalogoResponse;
import com.example.ms_pedidos.model.Carrito;
import com.example.ms_pedidos.model.DetalleCarrito;
import com.example.ms_pedidos.model.Pedido;
import com.example.ms_pedidos.repository.CarritoRepository;
import com.example.ms_pedidos.repository.DetalleCarritoRepository;
import com.example.ms_pedidos.repository.DetallePedidoRepository;
import com.example.ms_pedidos.repository.PedidoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PedidoServiceTest {

    private static final String EMAIL = "ana@gmail.com";

    private PedidoRepository pedidoRepository;
    private DetalleCarritoRepository detalleCarritoRepository;
    private CatalogoClient catalogo;
    private PedidoService service;

    @BeforeEach
    void preparar() {
        CarritoRepository carritoRepository = mock(CarritoRepository.class);
        detalleCarritoRepository = mock(DetalleCarritoRepository.class);
        pedidoRepository = mock(PedidoRepository.class);
        catalogo = mock(CatalogoClient.class);

        Carrito carrito = new Carrito();
        carrito.setIdCarrito(1);
        carrito.setUsuarioEmail(EMAIL);
        when(carritoRepository.findByUsuarioEmail(EMAIL)).thenReturn(Optional.of(carrito));
        when(detalleCarritoRepository.findByCarrito_IdCarrito(1)).thenReturn(List.of(linea(carrito, 10, 2)));

        // producto con oferta: el pedido debe cobrar 19990, no 29990
        when(catalogo.obtenerProducto(10)).thenReturn(new ProductoCatalogoResponse(
                10, "Red Dead Redemption 2", "x",
                new BigDecimal("29990"), new BigDecimal("19990"), 5, "S"));

        service = new PedidoService(carritoRepository, detalleCarritoRepository, pedidoRepository,
                mock(DetallePedidoRepository.class), catalogo, mock(PlatformTransactionManager.class));
    }

    @Test
    void creaPedidoConPrecioDeOfertaYDescuentaStockUnaVez() {
        when(pedidoRepository.save(any())).thenAnswer(i -> {
            Pedido p = i.getArgument(0);
            p.setIdPedido(99);
            return p;
        });

        PedidoResponse pedido = service.crearPedido(EMAIL);

        assertEquals(99, pedido.idPedido());
        assertEquals(new BigDecimal("39980"), pedido.totalAPagar());
        assertEquals("Red Dead Redemption 2", pedido.productos().get(0).nombreProducto());
        verify(catalogo).descontarStock(List.of(new LineaStock(10, 2)));
        verify(catalogo, never()).reponerStock(any());
    }

    @Test
    void siNoSePuedeGuardarElPedidoSeDevuelveElStock() {
        when(pedidoRepository.save(any())).thenThrow(new RuntimeException("base de datos caida"));

        assertThrows(RuntimeException.class, () -> service.crearPedido(EMAIL));

        // compensacion: lo descontado vuelve al catalogo
        verify(catalogo).reponerStock(List.of(new LineaStock(10, 2)));
    }

    @Test
    void siFaltaStockNoSeGuardaNadaNiSeVaciaElCarrito() {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT))
                .when(catalogo).descontarStock(any());

        assertThrows(ResponseStatusException.class, () -> service.crearPedido(EMAIL));

        verify(pedidoRepository, never()).save(any());
        verify(detalleCarritoRepository, never()).deleteAll(any());
    }

    private static DetalleCarrito linea(Carrito carrito, int productoId, int cantidad) {
        DetalleCarrito detalle = new DetalleCarrito();
        detalle.setCarrito(carrito);
        detalle.setProductoId(productoId);
        detalle.setCantidad(cantidad);
        return detalle;
    }
}
