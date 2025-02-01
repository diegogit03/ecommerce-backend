Aqui está o README atualizado com a seção de funcionalidades:  

---

# 🛒 API de E-commerce - AdonisJS 4 (Legado)  

Este projeto é uma API de e-commerce construída com [AdonisJS 4](https://adonisjs.com/), um framework para Node.js focado em produtividade e estruturação de código. O backend fornece endpoints para gerenciamento de usuários, produtos, pedidos, pagamentos e outras funcionalidades essenciais de um e-commerce.  

---

## 🚀 Tecnologias Utilizadas  

- **Node.js** - Ambiente de execução JavaScript  
- **AdonisJS 4** - Framework MVC para aplicações Node.js  
- **MySQL/PostgreSQL** - Banco de dados relacional  
- **JWT** - Autenticação segura  
- **Lucid ORM** - ORM para manipulação do banco de dados  
- **Japa** - Framework de testes para AdonisJS  
- **Mercado Pago API** - Integração para pagamentos online  

---

## ✨ Funcionalidades Principais  

### 🛍️ Gerenciamento de Produtos  
- Listar produtos  
- Criar novo produto  
- Atualizar produto existente  
- Deletar produto  

### 👤 Gerenciamento de Usuários  
- Registro de novos usuários  
- Autenticação de usuários (login/logout)  
- Atualização de perfil de usuário  
- Recuperação de senha  

### 📦 Gerenciamento de Pedidos  
- Criação de novos pedidos  
- Listagem de pedidos do usuário  
- Atualização de status do pedido  
- Cancelamento de pedidos  

### 🛒 Carrinho de Compras  
- Adicionar itens ao carrinho  
- Remover itens do carrinho  
- Atualizar quantidade de itens no carrinho  
- Visualizar itens no carrinho  

### 💳 Pagamentos  
- Processamento de pagamentos  
- Integração com gateways de pagamento (**Mercado Pago**)  

### 📂 Gerenciamento de Categorias  
- Listar categorias de produtos  
- Criar nova categoria  
- Atualizar categoria existente  
- Deletar categoria  

### 📦 Gerenciamento de Inventário  
- Atualização de estoque de produtos  
- Notificação de produtos fora de estoque  

### 📊 Relatórios e Análises  
- Geração de relatórios de vendas  
- Análise de desempenho de produtos  

### 🛠 Administração  
- Painel de administração para gerenciar usuários, produtos, pedidos e categorias  
- Controle de acesso baseado em permissões  

### 🔔 Notificações  
- Envio de notificações por e-mail para eventos importantes (ex: confirmação de pedido, recuperação de senha)  

---

## 📁 Estrutura do Projeto  

```
📦 ecommerce-api
├── 📂 app/
│   ├── 📂 Controllers/  # Controladores das requisições HTTP
│   ├── 📂 Models/       # Modelos que representam as entidades do banco
│   ├── 📂 Services/     # Lógica de negócios encapsulada
│   ├── 📂 Middleware/   # Middlewares para processamento de requisições
│   ├── 📂 Validators/   # Validações de entrada de dados
│   ├── 📂 Transformers/ # Formatação de dados de resposta
│
├── 📂 config/           # Configuração da aplicação (banco, autenticação, etc.)
├── 📂 database/
│   ├── 📂 migrations/   # Scripts de migração do banco de dados
│   ├── 📂 seeds/        # Seeds para popular o banco
│   ├── factory.js       # Geração de dados para testes
│
├── 📂 start/
│   ├── routes.js        # Definição das rotas da API
│   ├── kernel.js        # Configuração de middlewares globais
│   ├── hooks.js         # Extensões e hooks do AdonisJS
│
├── 📂 test/             # Testes automatizados
├── 📂 .vscode/          # Configurações do VSCode
├── .env.example        # Exemplo de configuração de ambiente
├── server.js           # Arquivo principal do servidor
├── package.json        # Dependências e scripts npm
└── README.md           # Documentação do projeto
```

---

## ⚙️ Instalação e Configuração  

### 1️⃣ Pré-requisitos  

Antes de iniciar, certifique-se de ter instalado:  

- **[Node.js](https://nodejs.org/)**  
- **[AdonisJS CLI](https://adonisjs.com/docs/4.1/installation)**  
- **Banco de dados** (MySQL ou PostgreSQL)  

### 2️⃣ Clonar o repositório  

```sh
git clone https://github.com/seu-usuario/ecommerce-adonis.git
cd ecommerce-adonis
```

### 3️⃣ Instalar dependências  

```sh
npm install
```

### 4️⃣ Configurar variáveis de ambiente  

Copie o arquivo `.env.example` e configure as credenciais do banco de dados, chaves de autenticação e credenciais do **Mercado Pago**:  

```sh
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário.  

### 5️⃣ Criar e popular o banco de dados  

```sh
adonis migration:run
adonis seed
```

### 6️⃣ Iniciar o servidor  

```sh
adonis serve --dev
```

A API estará disponível em: **`http://127.0.0.1:3333`**  

---

## 💳 Integração com Mercado Pago  

O sistema possui integração com o **Mercado Pago** para processar pagamentos online. A configuração da API do Mercado Pago deve ser feita no arquivo **`.env`**, preenchendo os seguintes campos com suas credenciais:  

```env
MP_ENV=
MP_ACCESS_TOKEN=
```

A API permite criar, consultar e processar pagamentos diretamente pelo Mercado Pago, garantindo segurança e confiabilidade para as transações.  

---

## 🛠 Testes  

Os testes são escritos com [Japa](https://github.com/thetutlage/japa).  

### Executar testes automatizados:  

```sh
adonis test
```

---

## 📜 Licença  

Este projeto está sob a licença **MIT**.  

Se precisar de suporte ou encontrar um bug, sinta-se à vontade para abrir uma _issue_! 🚀