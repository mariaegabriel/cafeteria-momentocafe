package com.br.cafeteriamomentocafe.repository;

import com.br.cafeteriamomentocafe.model.produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface produtoRepository extends JpaRepository<produto, Long> {

    List<produto> findByDisponivelTrue();

    List<produto> findByCategoria(String categoria);
}