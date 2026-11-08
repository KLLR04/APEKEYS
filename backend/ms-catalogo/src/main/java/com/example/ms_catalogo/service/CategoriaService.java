package com.example.ms_catalogo.service;

import com.example.ms_catalogo.model.Categoria;
import com.example.ms_catalogo.repository.CategoriaRepository;
import com.example.ms_catalogo.repository.ProductoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CategoriaService(
            CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository) {

        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    // listar categorias
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    // buscar categoria por id
    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Categoria no encontrada"
                ));
    }

    // crear categoria
    public Categoria guardar(Categoria categoria) {

        validarCategoria(categoria);

        categoria.setIdCategoria(null);
        categoria.setNombre(categoria.getNombre().trim());
        categoria.setDescripcion(categoria.getDescripcion().trim());

        return categoriaRepository.save(categoria);
    }

    // actualizar categoria
    public Categoria actualizar(Integer id, Categoria datos) {

        Categoria categoria = buscarPorId(id);

        validarCategoria(datos);

        categoria.setNombre(datos.getNombre().trim());
        categoria.setDescripcion(datos.getDescripcion().trim());

        return categoriaRepository.save(categoria);
    }

    // eliminar categoria si no tiene productos
    public void eliminar(Integer id) {

        Categoria categoria = buscarPorId(id);

        if (productoRepository.existsByCategoria_IdCategoria(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar una categoria con productos asociados"
            );
        }

        categoriaRepository.delete(categoria);
    }

    private void validarCategoria(Categoria categoria) {

        if (categoria == null
                || categoria.getNombre() == null
                || categoria.getNombre().isBlank()
                || categoria.getDescripcion() == null
                || categoria.getDescripcion().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar nombre y descripcion"
            );
        }

        if (categoria.getNombre().trim().length() > 50
                || categoria.getDescripcion().trim().length() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre admite 50 caracteres y la descripcion 100"
            );
        }
    }
}
