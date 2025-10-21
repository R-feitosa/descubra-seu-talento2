# Especificações do Modelo Visual RFeitosa para PDF

## Análise do Modelo Fornecido

### Capa (Página 1)
- **Layout**: Design diagonal em 3 faixas
  - Faixa 1: Vermelho escuro (#9D2723) - canto superior esquerdo
  - Faixa 2: Rosa claro (#E8B4B8 ou similar) - diagonal central
  - Faixa 3: Branco (#FFFFFF) - área central/inferior
- **Logo**: RFeitosa Advogados Associados (branco) no canto superior esquerdo
- **Título**: "Talentos Profissionais" centralizado
  - Fonte: Playfair Display
  - Tamanho: ~60-70pt
  - Cor: Preto
  - Peso: Bold

### Páginas Internas (Demais páginas)
- **Cabeçalho**: Faixa diagonal vermelha no canto superior esquerdo
  - Logo RFeitosa pequeno (branco)
- **Rodapé**: Faixa diagonal vermelha/rosa no canto inferior direito
- **Área de conteúdo**: Fundo branco
- **Margens**: Amplas para acomodar as faixas diagonais

### Tipografia
- **Títulos**: Playfair Display (serifada, elegante)
- **Subtítulos e corpo**: Roboto (sans-serif, moderna e legível)

### Cores
- Vermelho principal: #9D2723
- Rosa claro: #E8B4B8 (aproximado)
- Branco: #FFFFFF
- Preto: #000000

## Implementação no pdfMake

O pdfMake tem limitações para criar formas diagonais complexas. Estratégias:
1. Usar imagens SVG/PNG pré-renderizadas para os fundos
2. Usar canvas do pdfMake para desenhar formas
3. Criar templates de fundo como imagens

