package com.br.cafeteriamomentocafe.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
public class pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private cliente cliente;

    @Column(length = 2000)
    private String itens;

    private BigDecimal total;

    private String status;

    private LocalDateTime dataPedido;

    public pedido() {
    }

    public pedido(
            cliente cliente,
            String itens,
            BigDecimal total,
            String status,
            LocalDateTime dataPedido
    ) {
        this.cliente = cliente;
        this.itens = itens;
        this.total = total;
        this.status = status;
        this.dataPedido = dataPedido;
    }

    public Long getId() {
        return id;
    }

    public cliente getCliente() {
        return cliente;
    }

    public void setCliente(cliente cliente) {
        this.cliente = cliente;
    }

    public String getItens() {
        return itens;
    }

    public void setItens(String itens) {
        this.itens = itens;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }
}