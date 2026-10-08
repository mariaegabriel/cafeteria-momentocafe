package com.br.cafeteriamomentocafe.service;

import com.br.cafeteriamomentocafe.model.cliente;
import com.br.cafeteriamomentocafe.model.pedido;
import com.br.cafeteriamomentocafe.repository.clienteRepository;
import com.br.cafeteriamomentocafe.repository.pedidoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class pedidoService {

    private final pedidoRepository pedidoRepository;
    private final clienteRepository clienteRepository;

    public pedidoService(
            pedidoRepository pedidoRepository,
            clienteRepository clienteRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
    }

    public pedido criarPedido(Long clienteId, pedido pedido) throws Throwable {

        cliente cliente = (cliente) clienteRepository.findById(clienteId).orElseThrow(() ->
                        new RuntimeException("Cliente não encontrado."));

        pedido.setCliente(cliente);
        pedido.setStatus("EM_ATENDIMENTO");
        pedido.setDataPedido(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    public List<pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public List<pedido> pedidosDoCliente(Long clienteId) {
        return pedidoRepository.findByClienteId(clienteId);
    }

    public List<pedido> emAtendimento() {
        return pedidoRepository.findByStatus("EM_ATENDIMENTO");
    }

    public List<pedido> finalizados() {
        return pedidoRepository.findByStatus("FINALIZADO");
    }

    public pedido finalizar(Long id) {

        pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pedido não encontrado."));

        pedido.setStatus("FINALIZADO");

        return pedidoRepository.save(pedido);
    }
}