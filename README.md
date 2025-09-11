# 🚀 Meta Laghetto Tracker - MVP

Bem-vindo ao Meta Laghetto Tracker, uma plataforma interna desenvolvida para monitorizar e analisar a performance das campanhas de mídia da Rede Laghetto no Meta Ads.

Este projeto foi construído para centralizar os resultados, automatizar a geração de relatórios e fornecer insights acionáveis com o auxílio de IA, eliminando a necessidade de consolidação manual de dados em planilhas.

---
## 🎯 Visão Geral das Funcionalidades

* **Dashboard de Performance:** Uma visão completa e interativa com os principais KPIs (Investimento, ROAS, CPA), filtráveis por período.
* **Controle de Orçamento:** Monitorização do gasto mensal em relação a um teto predefinido e análise do ritmo de gasto diário.
* **Gráficos Dinâmicos:** Visualização da evolução diária do Gasto e do ROAS.
* **Relatório de Gastos Diários:** Uma tabela detalhada com a performance de cada campanha, agrupada por dia e com totais diários.
* **Insights com IA:** Um card de análise automatizada que usa o Google Gemini para gerar conclusões estratégicas com base nos dados do período.
* **Sincronização Automática:** Um sistema de backend que busca e atualiza os dados da API do Meta, mantendo a plataforma sempre atualizada.

---
## 🛠️ Estrutura do Projeto (Monorepo)

Este repositório está organizado como um monorepo, contendo duas pastas principais:

* **/backend:** A nossa API construída em Node.js com Express e TypeScript.
* **/frontend:** A nossa interface de utilizador construída com Next.js (React) e Tailwind CSS.

Para instruções detalhadas sobre como executar cada parte, consulte os ficheiros `README.md` dentro de cada uma dessas pastas.

---
## 🏃‍♂️ Como Começar

1.  **Pré-requisitos:** Docker, Node.js (v18+).
2.  **Configuração:** Siga as instruções nos `README.md` do `backend` e do `frontend` para configurar as variáveis de ambiente e instalar as dependências.
3.  **Execução:** Inicie o servidor do backend e depois o do frontend em terminais separados.