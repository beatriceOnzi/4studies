# **4Studies**

Controle de metas e tempo, oferecendo um ambiente aconchegante e organizado para os momentos de estudo.

Plataforma desenvolvida para auxiliar estudantes na organização e otimização de seus estudos, reunindo ferramentas que facilitam o acompanhamento do aprendizado e a gestão das atividades acadêmicas, como meta de horas para estudo, controle do tempo diário, anotações e objetivos. O sistema foi projetado para oferecer uma experiência que incentive o estudo, permitindo que os usuários centralizem suas anotações para o aprendizado, monitorem seu progresso e mantenham uma rotina de estudos mais eficiente. Com foco em proporcionar um ambiente aconchegante, com uma visualização do progresso através da paisagem de fundo, que evolui conforme o estudante acumula horas, o 4Studies busca transformar a forma como os estudantes enxergam o estudo, tornando o processo de aprendizagem mais prazeroso e divertido.

## Página inicial

<img width="959" height="437" alt="image" src="https://github.com/user-attachments/assets/1ca6cec9-64e5-4d89-86ba-aae8abbf4a27" />

## Requisitos

- Node.js 18
- NPM

---

## Tecnologias Utilizadas

- JavaScript (Node.js)
- Express
- Sequelize
- SQLite
- Handlebars
- Tailwind CSS
- JavaScript
- Jest

---

## Estrutura do Projeto

```
4studies/
│
├── src/
│   ├── models/         # Modelos do banco de dados
│   ├── routes/         # Rotas
│   ├── services/       # Regras de negócio
│   ├── tests/          # Testes
│   ├── views/          # Templates Handlebars
│   ├── public/         # CSS, imagens e scripts
│   ├── app.js          # Configuração do Express
│   ├── server.js       # Inicialização do servidor
│   └── database.js     # Configuração do banco
│
├── package.json
├── tailwind.config.js
└── README.md
```

---

## Instalação

Clone o repositório:

```
git clone <url-do-repositorio>
```

Instale as dependências:

```
npm install
```

---

## Executando o Projeto

Iniciar o servidor:

```
npm start
```
---

## Compilação do Tailwind CSS

Para atualizar os estilos durante o desenvolvimento:

```
npm run watch
```

---

## Funcionalidades

- Registro de sessões de estudo
- Cronômetro de acompanhamento
- Controle de horas estudadas
- Estatísticas diárias
- Estatísticas semanais
- Controle de metas
- Sistema de anotações
