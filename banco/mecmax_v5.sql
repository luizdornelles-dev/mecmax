-- =================================================================
-- SCRIPT COMPLETO: CRIAÇÃO DE ESTRUTURA E POVOAMENTO MASSIVO
-- CARGA COMPLETA: 31 Ferramentas, 17 Locais, e Múltiplos Cenários
-- =================================================================

CREATE DATABASE IF NOT EXISTS mecmax_web;
USE mecmax_web;

-- 1. LIMPEZA SEGURA DAS TABELAS E ESTRUTURAS ANTIGAS
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS emprestimos;
DROP TABLE IF EXISTS ferramentas;
DROP TABLE IF EXISTS mecanicos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS status_ferramenta;
DROP TABLE IF EXISTS localizacoes;
DROP TRIGGER IF EXISTS atualiza_status_emprestimo;
DROP TRIGGER IF EXISTS atualiza_status_devolucao;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. CRIAÇÃO DA ESTRUTURA BASE
CREATE TABLE categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome_categoria VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE status_ferramenta (
  id_status INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  descricao_status VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE localizacoes (
  id_localizacao INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome_local VARCHAR(100) NOT NULL,
  tipo_local VARCHAR(50),
  codigo_local VARCHAR(6) UNIQUE 
) ENGINE=InnoDB;

CREATE TABLE mecanicos (
  id_mecanico INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome_completo VARCHAR(100) NOT NULL,
  matricula VARCHAR(20) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('MECANICO', 'GERENTE') DEFAULT 'MECANICO',
  status_usuario ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE ferramentas (
  id_ferramenta INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo_ferramenta VARCHAR(20) NOT NULL UNIQUE,
  nome_ferramenta VARCHAR(100) NOT NULL,
  descricao TEXT,
  marca VARCHAR(50),
  id_categoria INT,
  id_status INT DEFAULT 1,
  data_aquisicao DATE,
  CONSTRAINT fk_ferramentas_cat FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria),
  CONSTRAINT fk_ferramentas_stat FOREIGN KEY (id_status) REFERENCES status_ferramenta (id_status)
) ENGINE=InnoDB;

CREATE TABLE emprestimos (
  id_emprestimo INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_mecanico INT NOT NULL,
  id_ferramenta INT NOT NULL,
  data_retirada DATETIME DEFAULT CURRENT_TIMESTAMP,
  previsao_devolucao DATETIME,
  data_devolucao DATETIME,
  id_localizacao INT,
  status_emprestimo ENUM('ATIVO', 'FINALIZADO', 'ATRASADO', 'DEVOLVIDO') DEFAULT 'ATIVO',
  observacoes TEXT,
  CONSTRAINT fk_emp_mec FOREIGN KEY (id_mecanico) REFERENCES mecanicos (id_mecanico),
  CONSTRAINT fk_emp_fer FOREIGN KEY (id_ferramenta) REFERENCES ferramentas (id_ferramenta),
  CONSTRAINT fk_emp_local FOREIGN KEY (id_localizacao) REFERENCES localizacoes (id_localizacao)
) ENGINE=InnoDB;

CREATE TABLE reservas (
  id_reserva INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_mecanico INT NOT NULL,
  id_ferramenta INT NOT NULL,
  data_reserva_inicio DATETIME NOT NULL,
  data_reserva_fim DATETIME NOT NULL,
  status_reserva ENUM('ATIVA', 'CANCELADA', 'CUMPRIDA', 'EXPIRADA') DEFAULT 'ATIVA',
  codigo_reserva VARCHAR(8),
  CONSTRAINT fk_res_mec FOREIGN KEY (id_mecanico) REFERENCES mecanicos (id_mecanico),
  CONSTRAINT fk_res_fer FOREIGN KEY (id_ferramenta) REFERENCES ferramentas (id_ferramenta)
) ENGINE=InnoDB;

-- 3. TRIGGERS (Automação de Status)
DELIMITER $$
CREATE TRIGGER atualiza_status_emprestimo AFTER INSERT ON emprestimos
FOR EACH ROW BEGIN
    IF NEW.status_emprestimo IN ('ATIVO', 'ATRASADO') THEN
        UPDATE ferramentas SET id_status = 2 WHERE id_ferramenta = NEW.id_ferramenta;
    END IF;
END$$

CREATE TRIGGER atualiza_status_devolucao AFTER UPDATE ON emprestimos
FOR EACH ROW BEGIN
    IF NEW.status_emprestimo IN ('FINALIZADO', 'DEVOLVIDO') THEN
        UPDATE ferramentas SET id_status = 1 WHERE id_ferramenta = NEW.id_ferramenta;
    END IF;
END$$
DELIMITER ;

-- =================================================================
-- 4. POVOAMENTO DE DADOS
-- =================================================================

-- STATUS E CATEGORIAS BASE
INSERT INTO status_ferramenta (descricao_status) VALUES 
('DISPONIVEL'), ('EMPRESTADA'), ('EM_MANUTENCAO'), ('RESERVADA'), ('INATIVA');

INSERT INTO categorias (nome_categoria) VALUES 
('Manuais'), ('Elétricas'), ('Diagnóstico'), ('Pneumáticas'), ('Elevação'), ('Especiais');

-- LOCALIZAÇÕES
INSERT INTO localizacoes (nome_local, tipo_local, codigo_local) VALUES 
('BOX 01 - Mecânica Geral', 'OFICINA', '001BOX'),
('BOX 02 - Mecânica Geral', 'OFICINA', '002BOX'),
('BOX 03 - Mecânica Geral', 'OFICINA', '003BOX'),
('BOX 04 - Mecânica Geral', 'OFICINA', '004BOX'),
('BOX 05 - Mecânica Geral', 'OFICINA', '005BOX'),
('BOX 06 - Diagnóstico Eletrônico', 'OFICINA', '006BOX'),
('BOX 07 - Diagnóstico Eletrônico', 'OFICINA', '007BOX'),
('Alinhador de direção computadorizado', 'OFICINA', '001ALI'),
('Balanceadora de rodas', 'OFICINA', '001BAL'),
('Bancada 1 - Área de Funilaria', 'FUNILARIA', '001FUN'),
('Bancada 2 - Área de Funilaria', 'FUNILARIA', '002FUN'),
('Bancada 3 - Área de Funilaria', 'FUNILARIA', '003FUN'),
('Cabine de Pintura', 'PINTURA', '001CAB'),
('Área de Preparação de Pintura', 'PINTURA', '001PRE'),
('Sala de Polimento', 'PINTURA', '001POL'),
('Estufa de Pintura 1', 'PINTURA', '001EST'),
('Estufa de Pintura 2', 'PINTURA', '002EST');

-- MECÂNICOS
INSERT INTO mecanicos (nome_completo, matricula, senha, perfil, status_usuario) VALUES 
('Administrador Geral', '000000', 'admin123', 'GERENTE', 'ATIVO'),
('João da Silva', '100001', '123456', 'MECANICO', 'ATIVO'),
('Maria Oliveira', '100002', '123456', 'MECANICO', 'ATIVO'),
('Carlos Souza', '100003', '123456', 'MECANICO', 'ATIVO'),
('Ana Pereira', '100004', '123456', 'MECANICO', 'ATIVO'),
('Roberto Santos', '100005', '123456', 'MECANICO', 'ATIVO'),
('Theo Dornelles', '101010', '123456', 'MECANICO', 'ATIVO'),
('Luiz Arthur', '101011', '123456', 'MECANICO', 'ATIVO'),
('Pedro Inativo', '100008', '123456', 'MECANICO', 'INATIVO');

-- FERRAMENTAS
INSERT INTO ferramentas (codigo_ferramenta, nome_ferramenta, marca, id_categoria, id_status, descricao) VALUES 
('SCA001', 'Scanner automotivo', 'Launch', 3, 1, 'Equipamento de diagnóstico eletrônico multimarca'),
('ALI002', 'Alinhador de direção computadorizado', 'Sun', 3, 1, 'Sistema de medição digital de alinhamento e geometria'),
('BAL003', 'Balanceadora de rodas', 'Vonder', 6, 1, 'Máquina automática para balanceamento de rodas'),
('TOR004', 'Torquímetro Digital', 'Gedore', 1, 1, 'Ferramenta para aperto preciso de parafusos'),
('CHV005', 'Chave de Impacto Pneumática 1', 'Puma', 4, 1, 'Aperto e desaperto rápido de parafusos e porcas'),
('GUI006', 'Guincho Hidráulico', 'Bovenau', 5, 1, 'Levantamento de motores ou peças pesadas'),
('SOL007', 'Soldador MIG/MAG', 'Esab', 6, 3, 'Soldagem profissional de metals'),
('ALI008', 'Ferramenta de Alinhamento 3D', 'Sun', 3, 1, 'Equipamento para alinhamento de rodas'),
('REF009', 'Estação de Refrigeração Automotiva', 'Texa', 6, 1, 'Recupera e recarrega gases de ar-condicionado'),
('CHV010', 'Chave de Impacto Pneumática 2', 'Makita', 4, 1, 'Aperto e desaperto rápido de parafusos e porcas'),
('INJ011', 'Estação de Teste de Injeção Etanol/Gasolina', 'Planatc', 3, 1, 'Testa e calibra sistemas de Injeção Etanol/Gasolina'),
('INJ012', 'Estação de Teste de Injeção Diesel', 'Bosch', 3, 5, 'Testa e calibra sistemas de injeção diesel'),
('EXT013', 'Extrator Hidráulico de Rolamentos', 'Sata', 1, 1, 'Remove rolamentos e engrenagens com segurança'),
('TOR014', 'Torno Mecânico Horizontal', 'Romi', 6, 1, 'Usinagem de peças cilíndricas, fabricação e reparo'),
('MUL015', 'Multímetro automotivo digital', 'Minipa', 3, 1, 'Diagnóstico elétrico e eletrônico'),
('SUP016', 'Suporte para Motor', 'Bovenau', 5, 1, 'Dispositivo para fixar e apoiar o motor'),
('CAR017', 'Carregador de Bateria', 'Vonder', 2, 1, 'Carregar e manter a carga das baterias'),
('FUR018', 'Furadeira de Bancada', 'Schulz', 2, 1, 'Ferramenta fixa para perfurar peças com precisão'),
('SIN019', 'Ferramenta de sincronismo de motor', 'Raven', 6, 3, 'Kit de travas para sincronismo de comando'),
('ANA020', 'Analisador de gases', 'Napro', 3, 1, 'Verificação de emissões automotivas'),
('PRE021', 'Prensa Hidráulica', 'Bovenau', 6, 1, 'Remover e instalar componentes com pressão'),
('LIM022', 'Limpador de Injectores Ultrassônico', 'Planatc', 6, 1, 'Limpeza e teste de bicos de combustível'),
('OLE023', 'Máquina de Troca de Óleo por Sucção', 'Vonder', 6, 1, 'Troca de óleo por sucção sem drenagem'),
('SCA024', 'Scanner para Caminhões', 'Texa', 3, 1, 'Diagnóstico específico para veículos pesados'),
('CAL025', 'Calibrador de Pneus com Teste', 'Schulz', 3, 1, 'Calibração e teste de vazamento em pneus'),
('BOM026', 'Bancada de Teste de Bombas Injetoras', 'Bosch', 3, 1, 'Testa e regula bombas injetoras'),
('PIS027', 'Pistola de pintura HVLP', 'Arprex', 4, 1, 'Aplicação de tinta e verniz com alta precisão'),
('SPO028', 'Spotter de funilaria', 'V8 Brasil', 6, 1, 'Repuxo de lataria e soldagem por ponto'),
('MIG029', 'Máquina MIG/MAG de solda', 'Esab', 6, 1, 'Soldagem de estruturas e chapas automotivas'),
('LIX030', 'Lixadeira roto-orbital pneumática', 'Makita', 4, 1, 'Lixamento de superfícies e preparação'),
('POL031', 'Politriz automotiva', 'Bosch', 2, 1, 'Polimento final da pintura');

-- EMPRÉSTIMOS
INSERT INTO emprestimos (id_mecanico, id_ferramenta, data_retirada, previsao_devolucao, data_devolucao, id_localizacao, status_emprestimo, observacoes) VALUES 
(1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), NULL, 6, 'ATIVO', 'Diagnóstico rápido'),
(2, 4, NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), NULL, 1, 'ATIVO', 'Aperto de cabeçote'),
(6, 27, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), NULL, 13, 'ATIVO', 'Pintura completa'),
(7, 30, NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), NULL, 14, 'ATIVO', 'Preparação de porta'),
(1, 28, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), NULL, 10, 'ATIVO', 'Repuxo na lateral - Novo ativo'),
(3, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 8, 'ATRASADO', 'Esqueceu de dar baixa'),
(4, 15, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 7, 'ATRASADO', 'Teste elétrico demorado'),
(2, 5, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 5 HOUR), NULL, 2, 'ATRASADO', 'Troca de pneus atrasou'),
(6, 17, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 3, 'ATRASADO', 'Carga esquecida na bateria');

INSERT INTO emprestimos (id_mecanico, id_ferramenta, data_retirada, previsao_devolucao, data_devolucao, id_localizacao, status_emprestimo, observacoes) VALUES 
(3, 10, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), 4, 'FINALIZADO', 'Teste concluído'),
(4, 13, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 5, 'FINALIZADO', 'Uso rápido de rolamento');

-- RESERVAS
INSERT INTO reservas (id_mecanico, id_ferramenta, data_reserva_inicio, data_reserva_fim, status_reserva) VALUES 
(3, 31, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'ATIVA'),
(1, 6, DATE_ADD(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'ATIVA'),
(7, 24, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 'ATIVA'),
(4, 9, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), 'CANCELADA'),
(2, 13, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY), 'CUMPRIDA');