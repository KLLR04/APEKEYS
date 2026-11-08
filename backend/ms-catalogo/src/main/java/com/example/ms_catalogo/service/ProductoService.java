package com.example.ms_catalogo.service;

import com.example.ms_catalogo.dto.LineaStock;
import com.example.ms_catalogo.model.Categoria;
import com.example.ms_catalogo.model.Producto;
import com.example.ms_catalogo.repository.CategoriaRepository;
import com.example.ms_catalogo.repository.ProductoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ProductoService {

    private static final BigDecimal PRECIO_MAXIMO = new BigDecimal("999999");
    private static final int STOCK_MAXIMO = 999999;

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final LimpiezaProductoClient limpiezaProductoClient;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository,
            LimpiezaProductoClient limpiezaProductoClient) {

        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.limpiezaProductoClient = limpiezaProductoClient;
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

        String codigo = normalizarCodigo(producto.getCodigo());

        if (productoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un producto con el codigo " + codigo
            );
        }

        producto.setIdProducto(null);
        copiarDatos(producto, producto, categoria);

        return productoRepository.save(producto);
    }

    // actualizar producto
    public Producto actualizarProducto(Integer id, Producto datos) {

        Producto producto = obtenerProducto(id);

        validarProducto(datos);
        Categoria categoria = obtenerCategoriaValida(datos);

        String codigo = normalizarCodigo(datos.getCodigo());

        if (productoRepository.existsByCodigoIgnoreCaseAndIdProductoNot(codigo, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe otro producto con el codigo " + codigo
            );
        }

        copiarDatos(datos, producto, categoria);

        return productoRepository.save(producto);
    }

    // eliminar producto y quitarlo de favoritos y carritos para no dejar referencias huerfanas
    public void eliminarProducto(Integer id) {

        Producto producto = obtenerProducto(id);

        // primero se limpian los otros microservicios; si fallan el producto no se borra
        limpiezaProductoClient.quitarDeFavoritosYCarritos(id);

        productoRepository.delete(producto);
    }

    // descontar el stock de todo un pedido: se descuentan todas las lineas o ninguna
    @Transactional
    public void descontarStock(List<LineaStock> lineas) {

        validarLineas(lineas);

        for (LineaStock linea : lineas) {

            int filasActualizadas = productoRepository.descontarStock(
                    linea.productoId(),
                    linea.cantidad()
            );

            // al lanzar la excepcion la transaccion se revierte y vuelven las lineas ya descontadas
            if (filasActualizadas == 0) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock insuficiente o producto no disponible: " + linea.productoId()
                );
            }
        }
    }

    // devolver stock cuando ms pedidos no logra guardar un pedido ya descontado
    @Transactional
    public void reponerStock(List<LineaStock> lineas) {

        validarLineas(lineas);

        for (LineaStock linea : lineas) {
            productoRepository.reponerStock(linea.productoId(), linea.cantidad());
        }
    }

    private void validarLineas(List<LineaStock> lineas) {

        if (lineas == null || lineas.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar al menos un producto"
            );
        }

        Set<Integer> vistos = new HashSet<>();

        for (LineaStock linea : lineas) {

            if (linea == null
                    || linea.productoId() == null
                    || linea.productoId() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El ID del producto no es valido"
                );
            }

            if (linea.cantidad() == null || linea.cantidad() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La cantidad debe ser mayor que cero"
                );
            }

            if (!vistos.add(linea.productoId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto " + linea.productoId() + " viene repetido"
                );
            }
        }
    }

    // pasar los datos validados al producto que se guardara
    private void copiarDatos(Producto origen, Producto destino, Categoria categoria) {

        destino.setCodigo(normalizarCodigo(origen.getCodigo()));
        destino.setNombre(origen.getNombre().trim());
        destino.setDescripcion(origen.getDescripcion().trim());
        destino.setPlataforma(origen.getPlataforma().trim());
        destino.setImagen(
                origen.getImagen() == null || origen.getImagen().isBlank()
                        ? null
                        : origen.getImagen().trim()
        );
        destino.setPrecio(origen.getPrecio());
        destino.setPrecioOferta(origen.getPrecioOferta());
        destino.setStock(origen.getStock());
        destino.setStockCritico(origen.getStockCritico() == null ? 0 : origen.getStockCritico());
        destino.setDisponibilidad(
                origen.getDisponibilidad().trim().toUpperCase(Locale.ROOT)
        );
        destino.setCategoria(categoria);
    }

    private String normalizarCodigo(String codigo) {
        return codigo.trim().toUpperCase(Locale.ROOT);
    }

    // validar campos del producto segun el mer
    void validarProducto(Producto producto) {

        if (producto == null
                || producto.getCodigo() == null || producto.getCodigo().isBlank()
                || producto.getNombre() == null || producto.getNombre().isBlank()
                || producto.getDescripcion() == null || producto.getDescripcion().isBlank()
                || producto.getPlataforma() == null || producto.getPlataforma().isBlank()
                || producto.getPrecio() == null
                || producto.getStock() == null
                || producto.getDisponibilidad() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe completar todos los campos del producto"
            );
        }

        if (producto.getCodigo().trim().length() > 20
                || producto.getNombre().trim().length() > 50
                || producto.getDescripcion().trim().length() > 100
                || producto.getPlataforma().trim().length() > 30
                || (producto.getImagen() != null && producto.getImagen().trim().length() > 500)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Largos maximos: codigo 20, nombre 50, descripcion 100, plataforma 30 e imagen 500"
            );
        }

        if (producto.getImagen() != null
                && !producto.getImagen().isBlank()
                && !producto.getImagen().trim().matches("^https?://\\S+$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La imagen debe ser una URL que comience con http:// o https://"
            );
        }

        if (!precioValido(producto.getPrecio())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El precio debe ser un entero entre 0 y 999999"
            );
        }

        if (producto.getPrecioOferta() != null
                && (!precioValido(producto.getPrecioOferta())
                    || producto.getPrecioOferta().signum() == 0
                    || producto.getPrecioOferta().compareTo(producto.getPrecio()) >= 0)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El precio de oferta debe ser mayor que 0 y menor que el precio normal"
            );
        }

        if (producto.getStock() < 0 || producto.getStock() > STOCK_MAXIMO) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El stock debe estar entre 0 y 999999"
            );
        }

        if (producto.getStockCritico() != null
                && (producto.getStockCritico() < 0 || producto.getStockCritico() > STOCK_MAXIMO)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El stock critico debe estar entre 0 y 999999"
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

    private boolean precioValido(BigDecimal precio) {
        return precio.signum() >= 0
                && precio.stripTrailingZeros().scale() <= 0
                && precio.compareTo(PRECIO_MAXIMO) <= 0;
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
