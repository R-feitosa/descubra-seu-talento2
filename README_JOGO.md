# RFeitosa Advogados: Descubra seu Talento

## 📋 Descrição

Jogo web interativo baseado no livro **"Os 6 Tipos de Talento Profissional"** de Patrick Lencioni, desenvolvido para o RFeitosa Advogados Associados. O jogo permite que usuários descubram seus talentos profissionais através de uma experiência gamificada com estética Game Boy Color.

## 🎮 Funcionalidades

### Para Usuários (Trainees)

1. **Cadastro Inicial**
   - Nome e WhatsApp para identificação
   - Criação automática de perfil no sistema

2. **Prólogo Narrativo**
   - Apresentação do escritório e do programa de trainee
   - Contextualização da jornada de 6 semanas

3. **6 Fases Temáticas**
   - **Fase 1 - Cível**: Cabines de trabalho individuais (Dra. Flávia)
   - **Fase 2 - Trabalhista**: Sala de Audiências/Tribunal (Dra. Flávia)
   - **Fase 3 - Empresarial**: Sala de Reuniões com Clientes (Dr. Roneely)
   - **Fase 4 - Tributário**: Escritório de Análise Fiscal (Dra. Patrícia)
   - **Fase 5 - Imobiliário**: Cartório e Documentação (Dr. Marcos)
   - **Fase 6 - Penal**: Delegacia e Defensoria (Dr. Lucas)

4. **24 Dilemas Profissionais**
   - 4 dilemas por fase
   - 4 opções de resposta por dilema
   - Cada opção pontua diferentes talentos (R, I, D, A, F, T)

5. **Resultados Personalizados**
   - Identificação dos 2 **Gênios de Trabalho** (maiores pontuações)
   - Identificação das 2 **Frustrações** (menores pontuações)
   - Tendência dominante (Ideação vs. Implementação)
   - Conselho de carreira personalizado baseado nos resultados

### Para Administradores

1. **Painel Administrativo** (`/admin`)
   - Requer autenticação via Manus OAuth
   - Estatísticas gerais (total, completos, em andamento)
   - Lista completa de participantes
   - Visualização de pontuações individuais (R, I, D, A, F, T)
   - Status de progresso de cada trainee

## 🎨 Design

O jogo utiliza uma estética **Game Boy Color** com:
- Paleta de cores verde característico
- Fonte pixelada (Press Start 2P)
- Efeitos de scanlines e sombras
- Animações suaves (fade-in, slide-in)
- Interface responsiva e nostálgica

## 🧠 Sistema de Talentos

### Os 6 Tipos de Talento (RIDAFT)

1. **R - Reflexão** (Wonder)
   - Questionar pressupostos
   - Pensamento estratégico profundo
   - Análise crítica de sistemas

2. **I - Invenção** (Invention)
   - Criar soluções inovadoras
   - Desenvolver novas abordagens
   - Originalidade e criatividade

3. **D - Discernimento** (Discernment)
   - Intuição aguçada
   - Avaliação rápida de situações
   - Identificação de padrões

4. **A - Arrebatamento** (Galvanizing)
   - Mobilizar pessoas
   - Gerar entusiasmo
   - Liderança inspiradora

5. **F - Facilitação** (Enablement)
   - Coordenar equipes
   - Garantir recursos
   - Apoiar o trabalho dos outros

6. **T - Tenacidade** (Tenacity)
   - Persistência incansável
   - Foco em execução
   - Trabalho árduo e dedicação

### Classificação de Resultados

- **Gênios de Trabalho**: 2 talentos com maiores pontuações (≥ média + 0.5)
- **Competências**: Talentos com pontuação mediana
- **Frustrações**: 2 talentos com menores pontuações (≤ média - 0.5)

### Tendências

- **Ideação**: Predominância de R, I, D (pensamento, análise, criação)
- **Implementação**: Predominância de A, F, T (ação, coordenação, execução)
- **Equilibrado**: Distribuição similar entre ambos os grupos

## 🛠️ Tecnologias

### Frontend
- **React 19** com TypeScript
- **Tailwind CSS 4** + CSS customizado para tema GBC
- **Wouter** para roteamento
- **tRPC React Query** para comunicação com backend

### Backend
- **Node.js** com Express
- **tRPC 11** para API type-safe
- **Drizzle ORM** para banco de dados
- **MySQL/TiDB** como banco de dados

### Autenticação
- **Manus OAuth** para painel administrativo
- Sistema de sessão com cookies JWT

## 📊 Estrutura do Banco de Dados

### Tabela: `trainees`
- `id`: ID único do trainee
- `name`: Nome completo
- `whatsapp`: Número de WhatsApp
- `currentPhase`: Fase atual (1-6)
- `completed`: Status de conclusão
- `scores`: JSON com pontuações (R, I, D, A, F, T)
- `createdAt`: Data de cadastro
- `completedAt`: Data de conclusão

### Tabela: `answers`
- `id`: ID único da resposta
- `traineeId`: Referência ao trainee
- `phase`: Número da fase (1-6)
- `dilemmaIndex`: Índice do dilema (0-3)
- `selectedOption`: Opção escolhida (0-3)
- `scoresAwarded`: JSON com pontos atribuídos
- `answeredAt`: Timestamp da resposta

## 🚀 Como Usar

### Acesso ao Jogo
1. Acesse a URL principal: `/`
2. Preencha nome e WhatsApp
3. Clique em "Iniciar Jogo"
4. Leia o prólogo
5. Responda aos 24 dilemas (4 por fase)
6. Visualize seus resultados ao final

### Acesso ao Painel Admin
1. Acesse `/admin`
2. Faça login com credenciais Manus
3. Visualize estatísticas e dados dos trainees

## 📁 Estrutura de Arquivos

```
rfeitosa-talento-game/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Game.tsx          # Componente principal do jogo
│   │   │   └── Admin.tsx         # Painel administrativo
│   │   ├── gbc-theme.css         # Estilos Game Boy Color
│   │   └── App.tsx               # Roteamento
├── server/
│   ├── routers.ts                # Rotas tRPC
│   └── db.ts                     # Funções de banco de dados
├── shared/
│   ├── talentos.json             # Dados dos 6 talentos
│   ├── conselhos.json            # Conselhos de carreira
│   └── dilemas.json              # 24 dilemas do jogo
└── drizzle/
    └── schema.ts                 # Schema do banco de dados
```

## 🎯 Objetivos do Projeto

### Para o Usuário
- Descobrir seus talentos profissionais naturais
- Receber orientações de carreira personalizadas
- Experiência gamificada e engajadora

### Para o RFeitosa Advogados
- Mapear perfis de candidatos talentosos
- Identificar fit cultural e profissional
- Dados estruturados para decisões de contratação

## 📝 Notas Técnicas

- O jogo salva automaticamente o progresso no banco de dados
- Cada resposta é registrada individualmente para análise posterior
- O sistema de pontuação é baseado no livro de Patrick Lencioni
- Os conselhos de carreira são personalizados para cada combinação de talentos
- O painel admin requer autenticação para proteger dados dos candidatos

## 🔒 Segurança

- Autenticação OAuth para área administrativa
- Dados de trainees protegidos por autenticação
- Sessões seguras com cookies JWT
- Validação de entrada em todas as rotas

## 📱 Responsividade

O jogo é totalmente responsivo e funciona em:
- Desktop (experiência completa)
- Tablet (otimizado)
- Mobile (adaptado para telas pequenas)

---

**Desenvolvido para RFeitosa Advogados Associados**  
Baseado no livro "Os 6 Tipos de Talento Profissional" de Patrick Lencioni (2023, Editora Sextante)

