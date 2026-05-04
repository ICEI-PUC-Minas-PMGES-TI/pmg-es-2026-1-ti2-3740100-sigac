# SIGAC (Sistema Integrado de Gestão e Administração Condominial)

Este projeto propõe o desenvolvimento de um sistema web (SIGAC) para otimizar e integrar os processos de administração condominial. O objetivo é centralizar o
cadastro de condomínios e prestadores de serviço, a alocação de pessoal e a gestão de
gastos em uma única plataforma. Ao final, espera-se como resultado uma aplicação
funcional que reduza falhas operacionais, otimize o tempo de gestão e aumente a
transparência administrativa através de um dashboard financeiro.


### Backend (Java)

* Caio Felix Reis
* Davi Mendes de Pinho Laudares Rodrigues
* Luca Moreira Ribeiro Mazala de Araujo
* Manoel Rodrigues Bezerra Neto
* Milena Cardoso de Araújo


## Professor

* Michelle Hanne Soares de Andrade
* Lucca Soares de Paiva Lacerda

## Instruções de utilização

Assim que a primeira versão do sistema estiver disponível, deverá complementar com as instruções de utilização. Descreva como instalar eventuais dependências e como executar a aplicação.

## Histórico de versões

* 0.1.1
    * CHANGE: Atualização das documentações. Código permaneceu inalterado.
* 0.1.0
    * Implementação da funcionalidade X pertencente ao processo P.
* 0.0.1
    * Trabalhando na modelagem do processo de negócio.

```bash
cd src/front
npm install
npm run dev
```

## Seed de demonstração

Os scripts de seed e limpeza do backend ficam em `src/back/scripts/`.

Pré-requisito:

- O backend deve estar em execução em `http://localhost:8080`

Para popular o banco com dados de demonstração de condomínios em Belo Horizonte:

```bash
cd src/back
node scripts/seed.js
```

O script:

- limpa o dataset de demonstração anterior
- garante a existência do usuário admin padrão
- cria condomínios, gestores, síndicos, funcionários, inquilinos, arrecadações, gastos, manutenções, avisos e solicitações
- exibe no final os logins de admin, gestores e síndicos criados

Para remover apenas os dados de demonstração:

```bash
cd src/back
node scripts/cleanup.js
```
