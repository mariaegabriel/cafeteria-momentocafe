package com.br.cafeteriamomentocafe.service;

import com.br.cafeteriamomentocafe.model.produto;
import com.br.cafeteriamomentocafe.repository.produtoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class produtoService {

    private final produtoRepository repository;

    public produtoService(produtoRepository repository) {
        this.repository = repository;
    }

    public List<produto> listar() {
        return repository.findAll();
    }

    public List<produto> listarDisponiveis() {
        return repository.findByDisponivelTrue();
    }

    public produto cadastrar(produto produto) {
        return repository.save(produto);
    }

    public produto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Produto não encontrado."));
    }

    public produto atualizar(Long id, produto dados) {

        produto produto = buscarPorId(id);

        produto.setNome(dados.getNome());
        produto.setDescricao(dados.getDescricao());
        produto.setPreco(dados.getPreco());
        produto.setCategoria(dados.getCategoria());
        produto.setImagem(dados.getImagem());
        produto.setDisponivel(dados.isDisponivel());

        return repository.save(produto);
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }
}