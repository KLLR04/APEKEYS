package com.example.ms_catalogo.service;

import com.example.ms_catalogo.dto.LineaStock;
import com.example.ms_catalogo.model.Categoria;
import com.example.ms_catalogo.model.Producto;
import com.example.ms_catalogo.repository.CategoriaRepository;
import com.example.ms_catalogo.repository.ProductoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductoServiceTest {

    private ProductoRepository productoRepository;
    private CategoriaRepository categoriaRepository;
    private LimpiezaProductoClient limpieza;
    private ProductoService service;

    @BeforeEach
    void preparar() {
        productoRepository = mock(ProductoRepository.class);
        categoriaRepository = mock(CategoriaRepository.class);
        limpieza = mock(LimpiezaProductoClient.class);
        service = new ProductoService(productoRepository, categoriaRepository, limpieza);
    }

    @Test
    void descontarStockFallaSiUnaLineaNoAlcanza() {
        // la primera linea se descuenta (1 fila) y la segunda no (0 filas)
        when(productoRepository.descontarStock(1, 1)).thenReturn(1);
        when(productoRepository.descontarStock(2, 1)).thenReturn(0);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.descontarStock(List.of(new LineaStock(1, 1), new LineaStock(2, 1))));

        // la excepcion hace que Spring revierta la transaccion completa (la linea 1 vuelve)
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    }

    @Test
    void descontarStockRechazaProductoRepetido() {
        assertThrows(ResponseStatusException.class,
                () -> service.descontarStock(List.of(new LineaStock(1, 1), new LineaStock(1, 2))));
        verify(productoRepository, never()).descontarStock(any(), any());
    }

    @Test
    void eliminarLimpiaFavoritosYCarritosAntesDeBorrar() {
        Producto producto = productoValido();
        when(productoRepository.findById(7)).thenReturn(Optional.of(producto));

        service.eliminarProducto(7);

        InOrder orden = inOrder(limpieza, productoRepository);
        orden.verify(limpieza).quitarDeFavoritosYCarritos(7);
        orden.verify(productoRepository).delete(producto);
    }

    @Test
    void siLaLimpiezaFallaNoSeBorraElProducto() {
        when(productoRepository.findById(7)).thenReturn(Optional.of(productoValido()));
        doThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE))
                .when(limpieza).quitarDeFavoritosYCarritos(7);

        assertThrows(ResponseStatusException.class, () -> service.eliminarProducto(7));
        verify(productoRepository, never()).delete(any());
    }

    @Test
    void precioOfertaDebeSerMenorQueElPrecio() {
        Producto producto = productoValido();
        producto.setPrecioOferta(new BigDecimal("39990"));

        assertThrows(ResponseStatusException.class, () -> service.validarProducto(producto));

        producto.setPrecioOferta(new BigDecimal("19990"));
        assertDoesNotThrow(() -> service.validarProducto(producto));
        assertEquals(new BigDecimal("19990"), producto.getPrecioFinal());
    }

    @Test
    void imagenDebeSerUnaUrl() {
        Producto producto = productoValido();
        producto.setImagen("portada.jpg");

        assertThrows(ResponseStatusException.class, () -> service.validarProducto(producto));
    }

    private static Producto productoValido() {
        Categoria categoria = new Categoria();
        categoria.setIdCategoria(1);

        Producto producto = new Producto();
        producto.setCodigo("GAM-001");
        producto.setNombre("Red Dead Redemption 2");
        producto.setDescripcion("Aventura en el lejano oeste");
        producto.setPlataforma("Steam");
        producto.setImagen("https://ejemplo.cl/rdr2.jpg");
        producto.setPrecio(new BigDecimal("39990"));
        producto.setStock(10);
        producto.setStockCritico(5);
        producto.setDisponibilidad("S");
        producto.setCategoria(categoria);
        return producto;
    }
}
