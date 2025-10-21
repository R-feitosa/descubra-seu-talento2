# 🎮 Descubra seu Talento - RFeitosa Advogados

Jogo interativo de avaliação de talentos profissionais desenvolvido para o programa de trainee da RFeitosa Advogados Associados.

![Status](https://img.shields.io/badge/status-production-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 📋 Sobre o Projeto

O jogo "Descubra seu Talento" é uma ferramenta inovadora que ajuda candidatos a identificarem seus talentos profissionais através de dilemas práticos do dia a dia em um escritório de advocacia.

### Características Principais

- ✅ **6 Fases Temáticas** - Cível, Trabalhista, Previdenciário, Controladoria, Planejamento e Marketing
- ✅ **24 Dilemas Profissionais** - Situações reais do cotidiano jurídico
- ✅ **6 Talentos Avaliados** - Raciocínio, Invenção, Discernimento, Arrebatamento, Facilitação e Tenacidade
- ✅ **Relatório PDF Profissional** - Com timbres institucionais da RFeitosa
- ✅ **Interface Moderna** - Design responsivo e intuitivo
- ✅ **Personagens Integrados** - Dra. Flávia, Dra. Leandra, Dr. Anderson e Jânio Edson

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** 18 + TypeScript
- **Vite** - Build tool moderno
- **TailwindCSS** - Estilização
- **tRPC** - Type-safe API

### Backend
- **Node.js** + TypeScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **Drizzle ORM** - Type-safe database queries
- **Python** + **ReportLab** - Geração de PDF

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- Python 3.11+
- pnpm (recomendado) ou npm

### Passos

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd rfeitosa-talento-game
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Instale dependências Python:**
```bash
python3.11 -m pip install reportlab pillow
```

4. **Configure variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. **Inicialize o banco de dados:**
```bash
pnpm db:push
```

6. **Inicie o servidor de desenvolvimento:**
```bash
pnpm dev
```

7. **Acesse:** http://localhost:3001

## 🎯 Como Jogar

1. **Início** - Preencha seu nome e WhatsApp
2. **Prólogo** - Conheça o Dr. Roneely e o programa de trainee
3. **Boas-vindas** - Receba orientações da Dra. Renata (Gerente de RH)
4. **6 Fases** - Jogue 4 dilemas por fase (24 no total)
5. **Resultados** - Veja seus talentos identificados
6. **Relatório** - Baixe seu PDF personalizado

## 📄 Estrutura do Projeto

```
rfeitosa-talento-game/
├── client/               # Frontend React
│   ├── public/          # Assets estáticos
│   │   ├── pdf-assets/  # Timbres para PDF
│   │   └── *.png        # Imagens do jogo
│   └── src/
│       ├── pages/       # Componentes de página
│       └── lib/         # Utilitários
├── server/              # Backend Node.js
│   ├── _core/          # Configuração base
│   ├── db.ts           # Funções de banco de dados
│   ├── routers.ts      # Endpoints da API
│   └── generate_pdf.py # Script de geração de PDF
├── shared/             # Dados compartilhados
│   ├── talentos.json   # Descrições dos talentos
│   ├── conselhos.json  # Conselhos de carreira
│   └── dilemas.json    # Dilemas do jogo
└── drizzle/            # Migrações do banco
```

## 🎨 Personalização

### Timbres do PDF

Os timbres estão em `client/public/pdf-assets/`:
- `capa-timbre.png` - Capa do relatório
- `pagina-timbre.png` - Páginas internas

### Cores Institucionais

- Vermelho principal: `#9D2723`
- Rosa transição: `#E8B4B8`

### Dilemas e Talentos

Edite os arquivos em `shared/`:
- `dilemas.json` - Adicionar/modificar dilemas
- `talentos.json` - Descrições dos talentos
- `conselhos.json` - Conselhos de carreira

## 📊 Banco de Dados

### Tabelas Principais

- **trainees** - Dados dos candidatos
- **answers** - Respostas aos dilemas
- **results** - Resultados calculados

### Backup

```bash
# Backup manual
cp data.db data.db.backup

# Restaurar
cp data.db.backup data.db
```

## 🔒 Segurança

- Sessões criptografadas
- Validação de entrada
- Rate limiting (recomendado para produção)
- HTTPS obrigatório em produção

## 📈 Deploy

Consulte o [GUIA-DEPLOY.md](./GUIA-DEPLOY.md) para instruções detalhadas de deploy em:
- VPS (Recomendado)
- Railway
- Render
- Vercel

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Verificar tipos
pnpm check
```

## 📝 Scripts Disponíveis

```bash
pnpm dev      # Desenvolvimento
pnpm build    # Build para produção
pnpm start    # Iniciar produção
pnpm check    # Verificar tipos TypeScript
pnpm format   # Formatar código
pnpm test     # Executar testes
pnpm db:push  # Aplicar migrações
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da RFeitosa Advogados Associados.

## 👥 Equipe

- **Cliente:** RFeitosa Advogados Associados
- **Desenvolvimento:** Manus AI
- **Data:** Outubro de 2025

## 📞 Suporte

Para dúvidas ou suporte:
- Email: contato@rfeitosa.com.br
- WhatsApp: (XX) XXXXX-XXXX

---

**Desenvolvido com ❤️ para RFeitosa Advogados Associados**

