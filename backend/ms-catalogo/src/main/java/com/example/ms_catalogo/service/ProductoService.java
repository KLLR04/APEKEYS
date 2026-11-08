package com.example.ms_catalogo.service;

import com.example.ms_catalogo.model.Categoria;
import com.example.ms_catalogo.model.Producto;
import com.example.ms_catalogo.repository.CategoriaRepository;
import com.example.ms_catalogo.repository.ProductoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class ProductoService {

    private static final BigDecimal PRECIO_MAXIMO = new BigDecimal("999999");
    private static final int STOCK_MAXIMO = 999999;

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository) {

        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // listar productos
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    // obtener producto por id
    public Producto obtenerProducto(Integer id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto no encontrado"
                ));
    }

    // listar productos por categoria
    public List<Producto> listarPorCategoria(Integer idCategoria) {
        return productoRepository.findByCategoria_IdCategoria(idCategoria);
    }

    // crear producto
    public Producto crearProducto(Producto producto) {

        validarProducto(producto);
        Categoria categoria = obtenerCategoriaValida(producto);

        producto.setIdProducto(null);
        producto.setNombre(producto.getNombre().trim());
        producto.setDescripcion(producto.getDescripcion().trim());
        producto.setDisponibilidad(
                producto.getDisponibilidad().trim().toUpperCase(Locale.ROOT)
        );
        producto.setCategoria(categoria);

        return productoRepository.save(producto);
    }

    // actualizar producto
    public Producto actualizarProducto(Integer id, Producto datos) {

        Producto producto = obtenerProducto(id);

        validarProducto(datos);
        Categoria categoria = obtenerCategoriaValida(datos);

        producto.setNombre(datos.getNombre().trim());
        producto.setDescripcion(datos.getDescripcion().trim());
        producto.setPrecio(datos.getPrecio());
        producto.setStock(datos.getStock());
        producto.setDisponibilidad(
                datos.getDisponibilidad().trim().toUpperCase(Locale.ROOT)
        );
        producto.setCategoria(categoria);

        return productoRepository.save(producto);
    }

    // eliminar producto
    public void eliminarProducto(Integer id) {
        Producto producto = obtenerProducto(id);
        productoRepository.delete(producto);
    }

    // descontar stock cuando ms pedidos confirma un pedido
    @Transactional
    public void descontarStock(Integer productoId, Integer cantidad) {

        if (productoId == null || productoId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del producto no es valido"
            );
        }

        if (cantidad == null || cantidad <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cantidad debe ser mayor que cero"
            );
        }

        int filasActualizadas = productoRepository.descontarStock(
                productoId,
                cantidad
        );

        if (filasActualizadas == 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No fue posible descontar el stock. Verifique la disponibilidad y las unidades disponibles"
            );
        }
    }

    // validar campos del producto segun el mer
    private void validarProducto(Producto producto) {

        if (producto == null
                || producto.getNombre() == null || producto.getNombre().isBlank()
                || producto.getDescripcion() == null || producto.getDescripcion().isBlank()
                || producto.getPrecio() == null
                || producto.getStock() == null
                || producto.getDisponibilidad() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe completar todos los campos del producto"
            );
        }

        if (producto.getNombre().trim().length() > 50
                || producto.getDescripcion().trim().length() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre admite 50 caracteres y la descripcion 100"
            );
        }

        if (producto.getPrecio().signum() < 0
                || producto.getPrecio().stripTrailingZeros().scale() > 0
                || producto.getPrecio().compareTo(PRECIO_MAXIMO) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El precio debe ser un entero entre 0 y 999999"
            );
        }

        if (producto.getStock() < 0 || producto.getStock() > STOCK_MAXIMO) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El stock debe estar entre 0 y 999999"
            );
        }

        String disponibilidad = producto.getDisponibilidad()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!disponibilidad.equals("S") && !disponibilidad.equals("N")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La disponibilidad debe ser S o N"
            );
        }
    }

    // validar que la categoria indicada exista
    private Categoria obtenerCategoriaValida(Producto producto) {

        if (producto.getCategoria() == null
                || producto.getCategoria().getIdCategoria() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar una categoria"
            );
        }

        Integer idCategoria = producto.getCategoria().getIdCategoria();

        return categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La categoria indicada no existe"
                ));
    }
}
