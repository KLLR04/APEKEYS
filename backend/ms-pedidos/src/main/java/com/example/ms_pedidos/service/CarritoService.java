package com.example.ms_pedidos.service;

import com.example.ms_pedidos.dto.CarritoResponse;
import com.example.ms_pedidos.dto.DetalleCarritoResponse;
import com.example.ms_pedidos.dto.ProductoCatalogoResponse;
import com.example.ms_pedidos.model.Carrito;
import com.example.ms_pedidos.model.DetalleCarrito;
import com.example.ms_pedidos.model.DetalleCarritoId;
import com.example.ms_pedidos.repository.CarritoRepository;
import com.example.ms_pedidos.repository.DetalleCarritoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final CatalogoClient catalogoClient;

    public CarritoService(
            CarritoRepository carritoRepository,
            DetalleCarritoRepository detalleCarritoRepository,
            CatalogoClient catalogoClient) {

        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.catalogoClient = catalogoClient;
    }

    // obtener el carrito del usuario o crearlo si no existe
    @Transactional
    public CarritoResponse obtenerOCrearCarrito(String email) {

        Carrito carrito = buscarOCrearCarrito(email);

        return construirRespuesta(carrito);
    }

    // agregar producto al carrito o sumar cantidad si ya estaba
    @Transactional
    public CarritoResponse agregarProducto(
            String email,
            Integer productoId,
            Integer cantidad) {

        validarCantidad(cantidad);

        ProductoCatalogoResponse producto = obtenerProductoDisponible(productoId);

        if (producto.stock() == null || producto.stock() < cantidad) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock insuficiente"
            );
        }

        Carrito carrito = buscarOCrearCarrito(email);

        DetalleCarritoId detalleId =
                new DetalleCarritoId(carrito.getIdCarrito(), productoId);

        DetalleCarrito detalle = detalleCarritoRepository
                .findById(detalleId)
                .orElse(null);

        if (detalle == null) {

            detalle = new DetalleCarrito();
            detalle.setCarrito(carrito);
            detalle.setProductoId(productoId);
            detalle.setCantidad(cantidad);

        } else {

            long nuevaCantidad = (long) detalle.getCantidad() + cantidad;

            if (nuevaCantidad > producto.stock()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La cantidad supera el stock disponible"
                );
            }

            detalle.setCantidad((int) nuevaCantidad);
        }

        detalleCarritoRepository.save(detalle);

        return construirRespuesta(carrito);
    }

    // reemplazar la cantidad de un producto del carrito
    @Transactional
    public CarritoResponse actualizarCantidad(
            String email,
            Integer productoId,
            Integer cantidad) {

        validarProductoId(productoId);
        validarCantidad(cantidad);

        Carrito carrito = buscarCarritoExistente(email);
        DetalleCarrito detalle = buscarDetalle(carrito, productoId);

        ProductoCatalogoResponse producto = obtenerProductoDisponible(productoId);

        if (producto.stock() == null || cantidad > producto.stock()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock insuficiente"
            );
        }

        detalle.setCantidad(cantidad);
        detalleCarritoRepository.save(detalle);

        return construirRespuesta(carrito);
    }

    // quitar un producto del carrito
    @Transactional
    public CarritoResponse eliminarProducto(String email, Integer productoId) {

        validarProductoId(productoId);

        Carrito carrito = buscarCarritoExistente(email);
        DetalleCarrito detalle = buscarDetalle(carrito, productoId);

        detalleCarritoRepository.delete(detalle);
        detalleCarritoRepository.flush();

        return construirRespuesta(carrito);
    }

    // vaciar todos los productos del carrito
    @Transactional
    public CarritoResponse vaciarCarrito(String email) {

        Carrito carrito = buscarOCrearCarrito(email);

        detalleCarritoRepository.deleteAll(
                detalleCarritoRepository.findByCarrito_IdCarrito(carrito.getIdCarrito())
        );
        detalleCarritoRepository.flush();

        return construirRespuesta(carrito);
    }

    // quitar un producto eliminado del catalogo de todos los carritos
    @Transactional
    public int quitarProductoDeTodos(Integer productoId) {

        validarProductoId(productoId);

        return detalleCarritoRepository.eliminarPorProducto(productoId);
    }

    private Carrito buscarOCrearCarrito(String email) {

        validarEmail(email);

        return carritoRepository
                .findByUsuarioEmail(email)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuarioEmail(email);

                    return carritoRepository.save(nuevo);
                });
    }

    private Carrito buscarCarritoExistente(String email) {

        validarEmail(email);

        return carritoRepository
                .findByUsuarioEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El usuario no tiene un carrito"
                ));
    }

    private DetalleCarrito buscarDetalle(Carrito carrito, Integer productoId) {

        return detalleCarritoRepository
                .findById(new DetalleCarritoId(carrito.getIdCarrito(), productoId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El producto no esta en el carrito"
                ));
    }

    private ProductoCatalogoResponse obtenerProductoDisponible(Integer productoId) {

        ProductoCatalogoResponse producto = catalogoClient.obtenerProducto(productoId);

        if (!"S".equalsIgnoreCase(producto.disponibilidad())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El producto no esta disponible"
            );
        }

        return producto;
    }

    private void validarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuario no identificado"
            );
        }
    }

    private void validarProductoId(Integer productoId) {
        if (productoId == null || productoId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del producto no es valido"
            );
        }
    }

    private void validarCantidad(Integer cantidad) {
        if (cantidad == null || cantidad <= 0 || cantidad > 999999) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cantidad debe estar entre 1 y 999999"
            );
        }
    }

    // armar la respuesta del carrito con sus productos
    private CarritoResponse construirRespuesta(Carrito carrito) {

        List<DetalleCarritoResponse> productos =
                detalleCarritoRepository
                        .findByCarrito_IdCarrito(carrito.getIdCarrito())
                        .stream()
                        .map(detalle -> new DetalleCarritoResponse(
                                detalle.getProductoId(),
                                detalle.getCantidad()
                        ))
                        .toList();

        return new CarritoResponse(
                carrito.getIdCarrito(),
                carrito.getUsuarioEmail(),
                productos
        );
    }
}
