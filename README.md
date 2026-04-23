
# 🚀 Waveon API

Backend da plataforma **Waveon**, uma aplicação fitness completa focada em treinos, nutrição e acompanhamento de progresso.

Esta API foi desenvolvida para suportar um ambiente real de produção, servindo como base para um app mobile construído em React Native.

---

## 🧠 Visão do projeto

A Waveon API centraliza toda a lógica de negócio do sistema, garantindo consistência de dados, segurança e escalabilidade.

O backend foi estruturado para atender um produto real, com foco em:

- organização de código
- performance
- facilidade de manutenção
- evolução contínua do sistema

---

## ⚙️ O que essa API resolve

A API permite que usuários autenticados possam:

- gerenciar seus treinos personalizados
- acompanhar sessões e progresso
- registrar alimentação diária
- controlar ingestão de água
- manter histórico estruturado por data
- sincronizar dados em tempo real com o app

---

## 🛠️ Stack utilizada

- **Node.js**
- **Express**
- **MySQL**
- **JWT (autenticação)**
- **dotenv**
- **mysql2**

---

## 🧩 Arquitetura

O projeto segue uma estrutura organizada e modular:
```
src/
├── config/ # conexão com banco
├── controllers/ # regras de negócio
├── routes/ # definição das rotas
├── middlewares/ # autenticação e validações
└── app.js # inicialização da aplicação
```

Essa separação facilita manutenção, testes e escalabilidade.

---

## 🔐 Segurança

- autenticação baseada em JWT
- rotas protegidas por middleware
- isolamento de dados por usuário

---

## 📱 Integração

Essa API foi construída para funcionar integrada com um aplicativo mobile, garantindo:

- comunicação eficiente via REST
- respostas otimizadas para UI
- persistência de dados em tempo real
- suporte a sessões e estado do usuário

---

## 🚀 Execução

Instale as dependências:

```
npm install
```
Inicie o servidor:
```
npm start
```
Ambiente de desenvolvimento:
```
npx nodemon src/app.js
```
💡 Diferenciais
estrutura pensada para produto real

backend desacoplado do frontend

pronto para escalar (novas features, premium, etc)

integração completa com app mobile

modelagem de dados voltada para uso contínuo

📈 Evolução planejada
metas nutricionais personalizadas

dashboards e analytics

sistema de planos premium

notificações e lembretes

documentação automática (Swagger)

deploy em ambiente cloud

👨‍💻 Autor
Desenvolvido por Felippe Pedroso como projeto real e parte do portfólio profissional.
