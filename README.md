# DSList — Catálogo de Jogos

Este é um projeto full-stack e monorepo para gerenciamento e visualização de um catálogo de jogos, desenvolvido durante o Intensivão Java Spring (DevSuperior) e modernizado com um frontend moderno.

O projeto consiste em:
- **Backend**: API REST desenvolvida em Java 21 com Spring Boot e banco de dados PostgreSQL.
- **Frontend**: Aplicação web SPA construída em Angular 19, utilizando uma interface dark premium responsiva e com efeitos visuais avançados (glassmorphism).

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 21** & **Spring Boot 3**
- **Spring Data JPA** (Persistência)
- **PostgreSQL** (Banco de dados de Produção/Dev)
- **H2 Database** (Banco de dados em memória para testes rápidos)
- **Maven** (Gerenciador de dependências)

### Frontend
- **Angular 19**
- **RxJS** (Programação Reativa para requisições de API)
- **Vanilla CSS** (Design system customizado)
- **Google Fonts** (Fontes *Outfit* e *Inter*)

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
1. [Java JDK 21](https://adoptium.net/temurin/releases/?version=21)
2. [Node.js 24.x](https://nodejs.org/) ou superior
3. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para rodar o PostgreSQL)

---

### Passo 1: Iniciar o Banco de Dados (PostgreSQL via Docker)
Certifique-se de que o **Docker Desktop** está aberto e rodando. Em seguida, no terminal da raiz do projeto, execute:
```bash
docker-compose up -d
```
*Isso criará e iniciará o container do PostgreSQL mapeado na porta local `5433`.*

---

### Passo 2: Executar o Backend (Spring Boot)
1. Navegue até o diretório `backend`:
   ```bash
   cd backend
   ```
2. Inicie a aplicação Spring Boot utilizando o Maven Wrapper:
   ```bash
   .\mvnw spring-boot:run
   ```
   *O backend estará acessível em `http://localhost:8080`.*

> 💡 **Nota (Banco em Memória):** Se preferir rodar sem o Docker/Postgres, abra o arquivo `backend/src/main/resources/application.properties` e mude o perfil ativo para `test` (`spring.profiles.active=${APP_PROFILE:test}`). O sistema usará o banco H2 automático.

---

### Passo 3: Executar o Frontend (Angular 19)
1. Em um novo terminal, navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências do projeto (se necessário na primeira execução):
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Angular:
   ```bash
   npm start
   ```
4. Abra o seu navegador e acesse:
   ```text
   http://localhost:4200
   ```

---

## 🎨 Funcionalidades da Interface Frontend
- **Design Obsidian Dark**: Cores escuras sob medida com detalhes de iluminação neon em roxo e ciano.
- **Glassmorphism**: Efeitos visuais modernos utilizando desfoque e transparência de fundo.
- **Navegação Dinâmica**: Sidebar lateral que permite filtrar o catálogo por listas/coleções dinamicamente sem recarregar a página.
- **Notas Dinâmicas**: Badges de avaliação que mudam de cor (Verde/Amarelo/Vermelho) conforme o score do Metacritic do jogo.
- **Visualização de Detalhes**: Página rica de detalhes contendo imagem de banner estendida, gênero, ano de lançamento, plataformas de suporte e descrição detalhada.
