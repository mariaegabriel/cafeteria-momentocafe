package com.br.cafeteriamomentocafe.controller;

import com.br.cafeteriamomentocafe.model.produto;
import com.br.cafeteriamomentocafe.service.produtoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class produtoController {

    private final produtoService service;

    public produtoController(produtoService service) {
        this.service = service;
    }

    @GetMapping
    public List<produto> listar() {
        return service.listar();
    }

    @GetMapping("/disponiveis")
    public List<produto> listarDisponiveis() {
        return service.listarDisponiveis();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Long id) {

        try {
            return ResponseEntity.ok(service.buscarPorId(id));

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public produto cadastrar(@RequestBody produto produto) {
        return service.cadastrar(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @RequestBody produto produto
    ) {

        try {
            return ResponseEntity.ok(
                    service.atualizar(id, produto)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {

        service.excluir(id);

        return ResponseEntity.ok(
                "Produto excluído com sucesso."
        );
    }
}