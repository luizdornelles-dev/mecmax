# MecMax - Sistema Web de Gestão e Rastreamento de Ferramentas

## 1. Sobre o Projeto

O **MecMax** é um sistema web desenvolvido para auxiliar oficinas mecânicas no controle, rastreamento e gestão de ferramentas utilizadas pelos mecânicos durante os serviços.

A solução substitui controles manuais, planilhas e anotações em papel por uma aplicação digital com autenticação de usuários, registro de empréstimos, devoluções, reservas, controle de status das ferramentas, gestão de locais de uso e relatórios gerenciais.

O projeto foi desenvolvido como parte da unidade curricular **Projeto Aplicado III**, do curso de **Análise e Desenvolvimento de Sistemas - SENAI/UNISENAI**.

---

## 2. Integrantes

* Theo Faral Dornelles
* Luiz Arthur Dornelles

---

## 3. Objetivo da Solução

O objetivo do MecMax é oferecer maior controle patrimonial e operacional para oficinas mecânicas, permitindo que gestores e mecânicos acompanhem em tempo real:

* quais ferramentas estão disponíveis;
* quais ferramentas estão emprestadas;
* quais ferramentas estão atrasadas;
* quais ferramentas estão em manutenção;
* quem está usando cada ferramenta;
* em qual local ou box a ferramenta está sendo utilizada;
* quais reservas estão ativas, cumpridas, expiradas ou canceladas;
* quais ferramentas são mais utilizadas;
* quais mecânicos possuem mais atrasos.

---

## 4. Tecnologias Utilizadas

### Frontend

* React
* React Router DOM
* Axios
* SweetAlert2
* CSS responsivo próprio

### Backend

* Node.js
* Express
* MySQL
* mysql2/promise
* dotenv
* cors

### Banco de Dados

* MySQL
* Script SQL de criação e povoamento localizado na pasta `banco/`

---

## 5. Estrutura do Projeto

```text
MECMAX/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
├── banco/
│   └── mecmax_v5.sql
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── .env
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

---

## 6. Funcionalidades Implementadas

### 6.1 Login e Controle de Perfil

O sistema possui login único com separação de perfis:

* Mecânico
* Gerente

Após o login, o usuário é direcionado automaticamente para sua área correspondente.

### 6.2 Funcionalidades do Mecânico

O perfil mecânico pode:

* consultar ferramentas;
* visualizar status das ferramentas;
* registrar empréstimo de ferramenta disponível;
* editar previsão e local de um empréstimo próprio;
* registrar devolução;
* criar reservas;
* editar reservas próprias ativas;
* cancelar reservas próprias ativas;
* consultar lista de reservas.

### 6.3 Funcionalidades do Gerente

O perfil gerente pode:

* acessar painel administrativo;
* gerenciar ferramentas;
* gerenciar mecânicos;
* gerenciar locais e boxes;
* consultar relatórios;
* acompanhar ferramentas em uso;
* visualizar ferramentas atrasadas;
* analisar reservas;
* acompanhar indicadores operacionais.

### 6.4 Regras de Negócio

O sistema implementa regras de negócio para garantir integridade operacional:

* ferramentas em manutenção não podem ser emprestadas;
* ferramentas em manutenção não podem ser reservadas;
* ferramentas inativas não podem ser emprestadas;
* ferramentas inativas não podem ser reservadas;
* ferramentas emprestadas não podem ser enviadas para manutenção manualmente;
* ferramentas atrasadas têm status controlado automaticamente;
* empréstimos vencidos são marcados como atrasados;
* reservas vencidas e não utilizadas são marcadas como expiradas;
* reservas utilizadas no período correto são marcadas como cumpridas;
* reservas canceladas, expiradas ou cumpridas não bloqueiam novos empréstimos ou reservas;
* o sistema bloqueia colisões entre reservas e empréstimos;
* gerente não cria empréstimos;
* gerente não cria reservas;
* ações administrativas são protegidas por perfil.

---

## 7. Relatórios Gerenciais

O sistema possui um painel de relatórios para auxiliar o gerente na tomada de decisão.

Relatórios disponíveis:

1. **Histórico de Empréstimos**

   * Lista os empréstimos registrados.
   * Permite filtro por status.

2. **Visão Geral**

   * Mostra totais de ferramentas, reservas e empréstimos.

3. **Ferramentas Mais Usadas**

   * Exibe ranking de ferramentas com maior número de empréstimos.

4. **Atrasos por Mecânico**

   * Exibe ranking de mecânicos com mais atrasos.

5. **Ferramentas em Uso**

   * Lista ferramentas emprestadas e atrasadas, com mecânico, local e previsão.

6. **Reservas**

   * Mostra reservas ativas, cumpridas, expiradas e canceladas.

---

## 8. Usuários de Teste

### Gerente

```text
Matrícula: 000000
Senha: admin123
```

### Mecânicos

As senhas dos mecânicos cadastrados no banco de dados de teste são:

```text
Senha: 123456
```

Exemplos de mecânicos disponíveis para teste devem ser verificados no povoamento do banco de dados ou na tela de gerenciamento de mecânicos.

---

## 9. Como Rodar o Projeto Localmente

### 9.1 Pré-requisitos

Antes de executar o sistema, é necessário ter instalado:

* Node.js
* npm
* MySQL
* MySQL Workbench
* Visual Studio Code

---

## 10. Configuração do Banco de Dados

### 10.1 Criar e povoar o banco

1. Abrir o MySQL Workbench.
2. Conectar no servidor MySQL local.
3. Abrir o arquivo SQL localizado em:

```text
banco/mecmax_v5.sql
```

4. Executar o script completo.
5. Confirmar se o banco `mecmax_web` foi criado.

---

## 11. Configuração do Backend

### 11.1 Entrar na pasta do backend

```bash
cd backend
```

### 11.2 Instalar dependências

```bash
npm install
```

### 11.3 Conferir o arquivo `.env`

O arquivo `backend/.env` deve conter configuração semelhante a:

```env
PORT=3002
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=mecmax_web
```

Caso a senha do MySQL local seja diferente, alterar o valor de:

```env
DB_PASSWORD=root
```

para a senha correta do computador.

### 11.4 Rodar o backend

```bash
npm start
```

Resultado esperado:

```text
Backend MecMax rodando na porta 3002
```

O backend ficará disponível em:

```text
http://localhost:3002
```

---

## 12. Configuração do Frontend

### 12.1 Entrar na pasta do frontend

Em outro terminal:

```bash
cd frontend
```

### 12.2 Instalar dependências

```bash
npm install
```

### 12.3 Conferir o arquivo `.env`

O arquivo `frontend/.env` deve conter:

```env
REACT_APP_API_URL=http://localhost:3002/api
```

### 12.4 Rodar o frontend

```bash
npm start
```

Resultado esperado:

```text
O sistema abrirá no navegador em http://localhost:3000
```

---

## 13. Ordem Recomendada para Execução

Para executar corretamente o sistema:

1. Abrir o MySQL.
2. Executar o script do banco, se ainda não tiver sido importado.
3. Rodar o backend.
4. Rodar o frontend.
5. Acessar o sistema no navegador.

---

## 14. Endpoints Principais

### Mecânicos

```text
POST /api/mecanicos/login
GET /api/mecanicos
POST /api/mecanicos
GET /api/mecanicos/:id
PUT /api/mecanicos/:id
DELETE /api/mecanicos/:id
```

### Ferramentas

```text
GET /api/ferramentas
GET /api/ferramentas/completo
GET /api/ferramentas/:id
POST /api/ferramentas
PUT /api/ferramentas/:id
PUT /api/ferramentas/:id/excluir
PUT /api/ferramentas/:id/manutencao
```

### Empréstimos

```text
GET /api/emprestimos
GET /api/emprestimos/relatorio
GET /api/emprestimos/:id
POST /api/emprestimos
PUT /api/emprestimos/:id
PUT /api/emprestimos/:id/devolver
```

### Reservas

```text
GET /api/reservas
GET /api/reservas/:id
POST /api/reservas
PUT /api/reservas/:id
DELETE /api/reservas/:id
```

### Localizações

```text
GET /api/localizacoes
GET /api/localizacoes/:id
POST /api/localizacoes
PUT /api/localizacoes/:id
DELETE /api/localizacoes/:id
```

---

## 15. Deploy em Nuvem

> ⚠️ **PENDÊNCIA ANTES DA ENTREGA DA AV4**
>
> Inserir aqui o link público do sistema publicado em nuvem após o deploy.
>
> Este link deve ser testado em uma guia anônima antes do envio no AVA.

### 🔗 Link do Sistema em Nuvem

PENDENTE: inserir aqui o link do sistema após o deploy.

---

## 16. Repositório do Projeto

> ⚠️ **PENDÊNCIA ANTES DA ENTREGA DA AV4**
>
> Inserir aqui o link público do repositório oficial no GitHub.
>
> O link deve ser testado em uma guia anônima para confirmar que está acessível ao professor.

### 🔗 Link do Repositório GitHub

PENDENTE: inserir aqui o link do repositório após publicação no GitHub.
---

## 17. Como Testar Rapidamente

### 17.1 Teste do gerente

1. Acessar o sistema.
2. Fazer login com:

```text
Matrícula: 000000
Senha: admin123
```

3. Confirmar se abre o painel administrativo.
4. Acessar:

   * Ferramentas;
   * Mecânicos;
   * Locais;
   * Relatórios.

### 17.2 Teste do mecânico

1. Sair do gerente.
2. Entrar com uma matrícula de mecânico cadastrada.
3. Usar senha:

```text
123456
```

4. Confirmar se abre a tela de consulta de ferramentas.
5. Testar:

   * consulta;
   * empréstimo;
   * devolução;
   * reserva.

---

## 18. Observações Importantes

* O sistema usa `sessionStorage`, portanto, ao fechar a aba ou navegador, o usuário precisa fazer login novamente.
* As mensagens visuais são exibidas com SweetAlert2.
* O backend utiliza validações para impedir conflitos de reservas e empréstimos.
* O gerente possui permissões administrativas.
* O mecânico possui acesso apenas às funcionalidades operacionais.
* O projeto foi desenvolvido com foco em MVP funcional, rastreabilidade e controle patrimonial de oficina mecânica.

---

## 19. Status do Projeto

Projeto em fase de MVP funcional para entrega da AV4.

Funcionalidades principais implementadas:

* login por perfil;
* empréstimos;
* devoluções;
* reservas;
* controle de status;
* gerenciamento administrativo;
* relatórios gerenciais;
* persistência em banco MySQL;
* frontend responsivo;
* backend com rotas protegidas.
