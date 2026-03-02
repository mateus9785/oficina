-- ============================================================
-- Oficina Mecânica — DDL completo
-- ============================================================

-- Note: run `npm run db:migrate` to apply schema changes

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
  id             CHAR(36)      NOT NULL,
  nome           VARCHAR(120)  NOT NULL,
  cpf_cnpj       VARCHAR(20)   NULL DEFAULT NULL,
  telefone       VARCHAR(20)   NOT NULL DEFAULT '',
  email          VARCHAR(120)  NOT NULL DEFAULT '',
  endereco       VARCHAR(500)  NOT NULL DEFAULT '',
  data_nascimento DATE          NULL DEFAULT NULL,
  cep            VARCHAR(10)   NOT NULL DEFAULT '',
  cidade         VARCHAR(80)   NOT NULL DEFAULT '',
  estado         CHAR(2)       NOT NULL DEFAULT '',
  rua            VARCHAR(200)  NOT NULL DEFAULT '',
  numero         VARCHAR(20)   NOT NULL DEFAULT '',
  complemento    VARCHAR(100)  NOT NULL DEFAULT '',
  observacoes    VARCHAR(1000) NOT NULL DEFAULT '',
  data_cadastro  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  criado_em      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cliente_cpf_cnpj (cpf_cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- veiculos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS veiculos (
  id            CHAR(36)      NOT NULL,
  cliente_id    CHAR(36)      NOT NULL,
  marca         VARCHAR(60)   NOT NULL DEFAULT '',
  modelo        VARCHAR(80)   NOT NULL DEFAULT '',
  ano           SMALLINT      NULL DEFAULT NULL,
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
  nome            VARCHAR(120)  NOT NULL,
  categoria       ENUM('motor','freio','suspensao','eletrica','filtro','oleo','transmissao','carroceria','acessorio','outros') NOT NULL DEFAULT 'outros',
  marca           VARCHAR(60)   NOT NULL DEFAULT '',
  quantidade      INT           NOT NULL DEFAULT 0,
  estoque_minimo  INT           NOT NULL DEFAULT 0,
  preco_compra    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  preco_venda     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  localizacao     VARCHAR(60)   NOT NULL DEFAULT '',
  servico_vinculado_nome  VARCHAR(120) NULL DEFAULT NULL,
  servico_vinculado_valor DECIMAL(10,2) NULL DEFAULT NULL,
  uso_total       INT           NOT NULL DEFAULT 0,
  criado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
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
  quantidade  INT           NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0.00,
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
  cliente_id          CHAR(36)      NULL DEFAULT NULL,
  veiculo_id          CHAR(36)      NULL DEFAULT NULL,
  nome_cliente        VARCHAR(120)  NOT NULL DEFAULT '',
  descricao_veiculo   VARCHAR(120)  NOT NULL DEFAULT '',
  desconto_percentual DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  status              ENUM('aguardando_aprovacao','aguardando_peca','em_execucao','pronto_retirada','finalizado') NOT NULL DEFAULT 'aguardando_aprovacao',
  data_abertura       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_finalizacao    DATETIME      NULL,
  descricao           VARCHAR(2000) NOT NULL DEFAULT '',
  km_entrada          INT UNSIGNED  NOT NULL DEFAULT 0,
  previsao_entrega    DATETIME      NULL,
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
  status            ENUM('pendente','pago') NOT NULL DEFAULT 'pendente',
  ordem_servico_id  CHAR(36)      NULL,
  recorrente_id     CHAR(36)      NULL,
  criado_em         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conta_tipo (tipo),
  KEY idx_conta_status (status),
  KEY idx_conta_vencimento (data_vencimento),
  KEY idx_conta_os (ordem_servico_id),
  KEY idx_conta_recorrente (recorrente_id),
  CONSTRAINT fk_conta_os FOREIGN KEY (ordem_servico_id) REFERENCES ordens_servico (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- despesas_recorrentes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS despesas_recorrentes (
  id             CHAR(36)      NOT NULL,
  categoria      ENUM('aluguel','salario','energia','agua','internet','manutencao','outros') NOT NULL DEFAULT 'outros',
  descricao      VARCHAR(200)  NOT NULL DEFAULT '',
  valor          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  dia_vencimento TINYINT       NOT NULL,
  ativo          TINYINT(1)    NOT NULL DEFAULT 1,
  observacoes    VARCHAR(1000) NOT NULL DEFAULT '',
  criado_em      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- configuracoes (chave-valor para parametros do sistema)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracoes (
  chave         VARCHAR(60)   NOT NULL,
  valor         VARCHAR(500)  NOT NULL DEFAULT '',
  atualizado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO configuracoes (chave, valor) VALUES ('desconto_maximo', '100');

-- ------------------------------------------------------------
-- anexos_os (imagens e vídeos vinculados a uma OS)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS anexos_os (
  id            CHAR(36)      NOT NULL,
  ordem_id      CHAR(36)      NOT NULL,
  nome_original VARCHAR(255)  NOT NULL,
  caminho       VARCHAR(500)  NOT NULL,
  tipo_mime     VARCHAR(100)  NOT NULL,
  tamanho       INT UNSIGNED  NOT NULL DEFAULT 0,
  criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_anexo_ordem (ordem_id),
  CONSTRAINT fk_anexo_ordem FOREIGN KEY (ordem_id) REFERENCES ordens_servico (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Migrações incrementais para bancos existentes
-- (Executar manualmente se o banco já existia antes desta versão)
-- ALTER TABLE ordens_servico MODIFY COLUMN cliente_id CHAR(36) NULL DEFAULT NULL;
-- ALTER TABLE ordens_servico MODIFY COLUMN veiculo_id CHAR(36) NULL DEFAULT NULL;
-- ALTER TABLE ordens_servico ADD COLUMN nome_cliente VARCHAR(120) NOT NULL DEFAULT '' AFTER veiculo_id;
-- ALTER TABLE ordens_servico ADD COLUMN descricao_veiculo VARCHAR(120) NOT NULL DEFAULT '' AFTER nome_cliente;
-- ALTER TABLE ordens_servico ADD COLUMN desconto_percentual DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER descricao_veiculo;
-- ALTER TABLE historico_precos ADD COLUMN quantidade INT NOT NULL DEFAULT 0;
-- ALTER TABLE historico_precos ADD COLUMN valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00;
-- ALTER TABLE historico_precos ADD COLUMN preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0.00;
-- ALTER TABLE pecas ADD COLUMN servico_vinculado_nome VARCHAR(120) NULL DEFAULT NULL AFTER localizacao;
-- ALTER TABLE pecas ADD COLUMN servico_vinculado_valor DECIMAL(10,2) NULL DEFAULT NULL AFTER servico_vinculado_nome;
-- (handled programmatically by migrate.ts)

