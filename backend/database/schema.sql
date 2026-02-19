-- ============================================================
-- Oficina Mecânica — DDL completo
-- ============================================================

CREATE DATABASE IF NOT EXISTS oficina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oficina;

-- ------------------------------------------------------------
-- usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id          CHAR(36)     NOT NULL,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(120) NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  role        ENUM('admin','funcionario') NOT NULL DEFAULT 'funcionario',
  ativo       TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- clientes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id            CHAR(36)      NOT NULL,
  nome          VARCHAR(120)  NOT NULL,
  cpf_cnpj      VARCHAR(20)   NOT NULL,
  telefone      VARCHAR(20)   NOT NULL DEFAULT '',
  email         VARCHAR(120)  NOT NULL DEFAULT '',
  endereco      VARCHAR(500)  NOT NULL DEFAULT '',
  observacoes   VARCHAR(1000) NOT NULL DEFAULT '',
  data_cadastro DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cliente_cpf_cnpj (cpf_cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- veiculos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS veiculos (
  id            CHAR(36)      NOT NULL,
  cliente_id    CHAR(36)      NOT NULL,
  tipo          ENUM('carro','moto') NOT NULL DEFAULT 'carro',
  marca         VARCHAR(60)   NOT NULL DEFAULT '',
  modelo        VARCHAR(80)   NOT NULL DEFAULT '',
  ano           SMALLINT      NOT NULL,
  placa         VARCHAR(10)   NOT NULL,
  cor           VARCHAR(40)   NOT NULL DEFAULT '',
  km            INT UNSIGNED  NOT NULL DEFAULT 0,
  observacoes   VARCHAR(1000) NOT NULL DEFAULT '',
  criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_veiculo_placa (placa),
  KEY idx_veiculo_cliente (cliente_id),
  CONSTRAINT fk_veiculo_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- pecas (estoque)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pecas (
  id              CHAR(36)      NOT NULL,
  codigo          VARCHAR(40)   NOT NULL,
  nome            VARCHAR(120)  NOT NULL,
  categoria       ENUM('motor','freio','suspensao','eletrica','filtro','oleo','transmissao','carroceria','acessorio','outros') NOT NULL DEFAULT 'outros',
  marca           VARCHAR(60)   NOT NULL DEFAULT '',
  quantidade      INT           NOT NULL DEFAULT 0,
  estoque_minimo  INT           NOT NULL DEFAULT 0,
  preco_compra    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  preco_venda     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  localizacao     VARCHAR(60)   NOT NULL DEFAULT '',
  uso_total       INT           NOT NULL DEFAULT 0,
  criado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_peca_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- historico_precos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_precos (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  peca_id     CHAR(36)      NOT NULL,
  data        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  preco       DECIMAL(10,2) NOT NULL,
  fornecedor  VARCHAR(120)  NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY idx_historico_peca (peca_id),
  CONSTRAINT fk_historico_peca FOREIGN KEY (peca_id) REFERENCES pecas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- ordens_servico
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordens_servico (
  id                  CHAR(36)      NOT NULL,
  numero              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  cliente_id          CHAR(36)      NOT NULL,
  veiculo_id          CHAR(36)      NOT NULL,
  status              ENUM('aguardando_aprovacao','aguardando_peca','em_execucao','pronto_retirada','finalizado') NOT NULL DEFAULT 'aguardando_aprovacao',
  data_abertura       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_finalizacao    DATETIME      NULL,
  descricao_problema  VARCHAR(2000) NOT NULL DEFAULT '',
  diagnostico         VARCHAR(2000) NOT NULL DEFAULT '',
  observacoes         VARCHAR(2000) NOT NULL DEFAULT '',
  km_entrada          INT UNSIGNED  NOT NULL DEFAULT 0,
  criado_em           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_os_numero (numero),
  KEY idx_os_cliente (cliente_id),
  KEY idx_os_veiculo (veiculo_id),
  KEY idx_os_status (status),
  CONSTRAINT fk_os_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id),
  CONSTRAINT fk_os_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- itens_os
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens_os (
  id              CHAR(36)      NOT NULL,
  ordem_id        CHAR(36)      NOT NULL,
  tipo            ENUM('peca','servico') NOT NULL DEFAULT 'servico',
  peca_id         CHAR(36)      NULL,
  descricao       VARCHAR(200)  NOT NULL DEFAULT '',
  quantidade      INT           NOT NULL DEFAULT 1,
  valor_unitario  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  criado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_item_ordem (ordem_id),
  KEY idx_item_peca (peca_id),
  CONSTRAINT fk_item_ordem FOREIGN KEY (ordem_id) REFERENCES ordens_servico (id) ON DELETE CASCADE,
  CONSTRAINT fk_item_peca FOREIGN KEY (peca_id) REFERENCES pecas (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- checklist_entrada
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checklist_entrada (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ordem_id    CHAR(36)      NOT NULL,
  zona        VARCHAR(80)   NOT NULL,
  tem_dano    TINYINT(1)    NOT NULL DEFAULT 0,
  descricao   VARCHAR(500)  NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY idx_checklist_ordem (ordem_id),
  CONSTRAINT fk_checklist_ordem FOREIGN KEY (ordem_id) REFERENCES ordens_servico (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- contas (financeiro)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contas (
  id                CHAR(36)      NOT NULL,
  tipo              ENUM('receita','despesa') NOT NULL,
  categoria         ENUM('ordem_servico','venda_peca','compra_peca','aluguel','salario','energia','agua','internet','manutencao','outros') NOT NULL DEFAULT 'outros',
  descricao         VARCHAR(200)  NOT NULL DEFAULT '',
  valor             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  data_vencimento   DATETIME      NOT NULL,
  data_pagamento    DATETIME      NULL,
  status            ENUM('pendente','pago','atrasado') NOT NULL DEFAULT 'pendente',
  ordem_servico_id  CHAR(36)      NULL,
  observacoes       VARCHAR(1000) NOT NULL DEFAULT '',
  criado_em         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conta_tipo (tipo),
  KEY idx_conta_status (status),
  KEY idx_conta_vencimento (data_vencimento),
  KEY idx_conta_os (ordem_servico_id),
  CONSTRAINT fk_conta_os FOREIGN KEY (ordem_servico_id) REFERENCES ordens_servico (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
