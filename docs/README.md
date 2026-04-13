# Sistema Integrado de Gestão e Administração Condominial (SIGAC)


* Caio Felix Reis 

* Davi Mendes de Pinho Laudares Rodrigues 

* Luca Moreira Ribeiro Mazala de Araujo 

* Manoel Rodrigues Bezerra Neto 

* Milena Cardoso de Araújo 
---

Professores:

* Michelle Hanne Soares de Andrade 

* Lucca Soares de Paiva Lacerda

* Luiz Carlos da Silva

** Prof. Nome do Prof 3 **

---

_Curso de Engenharia de Software_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade Católica de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. Este projeto propõe o desenvolvimento de um sistema web (SIGAC) para otimizar e integrar os processos de administração condominial. O objetivo é centralizar o cadastro de condomínios e prestadores de serviço, a alocação de pessoal e a gestão de gastos em uma única plataforma. Ao final, espera-se como resultado uma aplicação funcional que reduza falhas operacionais, otimize o tempo de gestão e aumente a transparência administrativa através de um dashboard financeiro.

---


## 1. Introdução

A documentação a seguir apresenta o projeto e o desenvolvimento do Sistema Integrado de Gestão e Administração Condominial (SIGAC).

### 1.1 Contextualização

O mercado condominial brasileiro tem passado por uma expressiva expansão nos últimos anos, exigindo cada vez mais profissionalização e soluções tecnológicas robustas. Segundo dados recentes do setor imobiliário, esse mercado movimenta aproximadamente R$ 300 bilhões anualmente em todo o país, refletindo o crescimento contínuo do número de condomínios e a complexidade na gestão desses espaços. A administração predial deixou de ser uma tarefa amadora para se tornar um negócio de grande escala, que envolve desde o controle rigoroso de prestadores de serviço e alocação de pessoal até a prestação de contas de recursos financeiros volumosos, tendo um aumento também no número de empresas especializadas nessa administração. No cenário regional de Belo Horizonte, polo onde este projeto está sendo desenvolvido, o impacto econômico e a demanda por inovações seguem a mesma tendência de alta. Apenas na capital mineira, o setor alcança cifras expressivas, com empresas nascidas na região movimentando mais de R$ 2,5 bilhões anuais em receitas e garantias associadas à administração condominial.

### 1.2 Problema

Apesar desse imenso volume de recursos e da alta exigência por transparência, muitas administradoras e síndicos ainda realizam o controle de tarefas de forma fragmentada, recorrendo a anotações manuais ou planilhas desconexas que aumentam a suscetibilidade a erros e a perda de dados. Nesse contexto de um mercado bilionário, o problema que este projeto pretende resolver é a ineficiência e a descentralização na comunicação e no registro de dados operacionais e financeiros dos condomínios. A motivação nasce da necessidade de criar uma ferramenta que facilite o dia a dia do administrador, reduzindo o tempo gasto com burocracias. O escopo de negócio escolhido foca, portanto, na automação dos processos internos de uma administradora de condomínios ou de um síndico profissional, buscando garantir que a padronização e o acesso rápido à informação sustentem a boa governança exigida hoje pelo setor.

### 1.3 Objetivo geral

O objetivo geral deste trabalho é desenvolver o Sistema Integrado de Gestão e Administração Condominial (SIGAC), uma aplicação web focada em centralizar e otimizar as rotinas operacionais e financeiras de condomínios.

#### 1.3.1 Objetivos específicos

Como objetivos específicos, destacam-se: 

Unificar e otimizar a gestão operacional: Centralizar o controle de prestadores de serviço e a alocação de funcionários em uma única plataforma, reduzindo o tempo gasto com burocracias manuais e minimizando falhas de comunicação. 

Prover clareza e controle financeiro: Disponibilizar uma visão em tempo real das receitas e despesas do condomínio através de um painel interativo (dashboard), facilitando o monitoramento de gastos e a tomada de decisões estratégicas pela administração.

### 1.4 Justificativas

A justificativa para o desenvolvimento do SIGAC baseia-se no gap do mercado de sistemas de gestão, existem opções no mercado mais voltados para as partes de pagamento e opções robustas demais. Considerando o volume bilionário de recursos movimentados por condomínios, a ausência de sistemas unificados gera vulnerabilidades financeiras e operacionais, para os pequenos desse me. A principal contribuição deste trabalho é fornecer uma ferramenta que elimina o retrabalho em tarefas cotidianas (como checagem de escalas e aprovação de fornecedores) e mitiga o risco de perda de dados. O benefício direto para o desafio proposto é a entrega de uma governança transparente, permitindo que gestores tomem decisões baseadas em dados consolidados visualmente em tempo real.

## 2. Participantes do processo

* Gestora de Condomínios (Stakeholder Primário): É a principal operadora do sistema, responsável pela gestão centralizada de múltiplos condomínios. Realiza o cadastro de condomínios e prestadores, faz a alocação de serviços e registra gastos operacionais. Atua de forma estratégica e operacional, garantindo organização e padronização dos processos. Seu papel é essencial para a confiabilidade dos dados do sistema. 

* Funcionários (Stakeholder Primário): São profissionais empregados nos condomínios e vinculados operacionalmente à gestora. Atuam como executores das atividades rotineiras, fornecendo dados cadastrais e cumprindo as alocações definidas. Seu papel está diretamente ligado à execução das tarefas operacionais. Representam a camada operacional dos processos. 

* Síndico do Condomínio (Stakeholder Secundário / Indireto): Atua como agente de acompanhamento e fiscalização da gestão condominial. Não opera diretamente o sistema, mas utiliza as informações para consultar prestadores associados e acompanhar gastos. Seu papel está ligado à transparência e governança do condomínio. Funciona como usuário consultivo dentro do processo. 

## 3. Modelagem do processo de negócio

### 3.1. Análise da situação atual

Atualmente, os processos de cadastro de condomínios, controle de funcionários e gestão de gastos são realizados de forma descentralizada, utilizando planilhas ou registros manuais, o que dificulta a rastreabilidade das informações e aumenta o risco de inconsistências.

### 3.2. Descrição geral da proposta de solução

A proposta de melhoria baseia-se na transformação dos processos atualmente executados de forma manual ou fragmentada em um fluxo digital integrado por meio do Sistema Integrado de Gestão e Administração Condominial (SIGAC). O modelo TO BE visa eliminar redundâncias, reduzir falhas humanas e centralizar as informações operacionais e financeiras em uma única plataforma. Com a implantação do SIGAC, esses processos passam a ser executados em ambiente digital unificado, permitindo maior controle, padronização e segurança dos dados.

As principais propostas de melhoria são:
* Digitalização dos cadastros: Os registros de condomínios e funcionários deixam de ser realizados em documentos físicos ou planilhas isoladas e passam a ser armazenados em banco de dados centralizado.
* Automação da alocação de funcionários: A associação entre funcionários e condomínios passa a ser realizada diretamente no sistema, reduzindo falhas de comunicação e facilitando a visualização das responsabilidades de cada profissional.
* Padronização do registro de gastos: Todas as despesas passam a ser cadastradas de forma estruturada, contendo informações como valor, data e condomínio vinculado, garantindo organização e rastreabilidade financeira.
* Disponibilização de informações em tempo real: O sistema possibilita consultas rápidas sobre funcionários alocados e gastos por condomínio, ampliando a transparência para a gestora e para o síndico.
* Apoio à tomada de decisão: Por meio de um painel financeiro (dashboard), os dados são apresentados de forma visual, permitindo a análise dos custos e a identificação de desvios operacionais.

### 3.3. Modelagem dos processos

[PROCESSO 1 - Cadastro de condomínios ](processo-1-cadastro-de-condominio.md "Detalhamento do Processo 1.")

[PROCESSO 2 - Cadastro de funcionários ](processo-2-cadastro-de-funcionários.md "Detalhamento do Processo 2.")

[PROCESSO 3 - Gestão de Manutenção ](processo-3-gestão-de-manutenção.md "Detalhamento do Processo 3.")

[PROCESSO 4 - Gestão de gastos ](processo-4-gestão-de-gastos.md "Detalhamento do Processo 4.")

[PROCESSO 5 - Gestão de avisos ](processo-5-gestão-de-avisos.md "Detalhamento do Processo 5.")

## 4. Projeto da solução

_O documento a seguir apresenta o detalhamento do projeto da solução. São apresentadas duas seções que descrevem, respectivamente: modelo relacional e tecnologias._

[Projeto da solução](solution-design.md "Detalhamento do projeto da solução: modelo relacional e tecnologias.")


## 5. Indicadores de desempenho

_O documento a seguir apresenta os indicadores de desempenho dos processos._

[Indicadores de desempenho dos processos](performance-indicators.md)


## 6. Interface do sistema

_A sessão a seguir apresenta a descrição do produto de software desenvolvido._ 

[Documentação da interface do sistema](interface.md)

## 7. Conclusão

_Apresente aqui a conclusão do seu trabalho. Deve ser apresentada aqui uma discussão dos resultados obtidos no trabalho, local em que se verifica as observações pessoais de cada aluno. Essa seção poderá também apresentar sugestões de novas linhas de estudo._

# REFERÊNCIAS

_Como um projeto de software não requer revisão bibliográfica, a inclusão das referências não é obrigatória. No entanto, caso você deseje incluir referências relacionadas às tecnologias, padrões, ou metodologias que serão usadas no seu trabalho, relacione-as de acordo com a ABNT._

_Verifique no link abaixo como devem ser as referências no padrão ABNT:_

http://portal.pucminas.br/imagedb/documento/DOC_DSC_NOME_ARQUI20160217102425.pdf

**[1.1]** - _ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001._

**[1.2]** - _COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8._

**[1.3]** - _CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996._

**[1.4]** - _SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514._

**[1.5]** - _RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016._



# APÊNDICES


_Atualizar os links e adicionar novos links para que a estrutura do código esteja corretamente documentada._


## Apêndice A - Código fonte

[Código do front-end](../src/front) -- repositório do código do front-end

[Código do back-end](../src/back)  -- repositório do código do back-end


## Apêndice B - Apresentação final


[Slides da apresentação final](presentations/)


[Vídeo da apresentação final](video/)






