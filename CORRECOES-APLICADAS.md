# Correções Aplicadas - Jogo "Descubra seu Talento"

## Resumo das Correções

Todas as 4 correções solicitadas foram implementadas com sucesso:

### ✅ 1. Layout do Relatório (Duas Colunas)

**Problema:** O relatório estava exibindo os talentos em lista vertical.

**Solução:** Modificado o componente `renderResults()` em `Game.tsx` para usar CSS Grid com duas colunas:

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
  {resultsData.geniuses.map((genius, index) => (
    <div key={index} className="talent-item" style={{ gridColumn: index === 0 ? '1' : '2' }}>
      <div className="talent-name">{genius.name}</div>
      <div className="talent-description" style={{ textAlign: 'justify' }}>
        {genius.detailedDescription || genius.description}
      </div>
    </div>
  ))}
</div>
```

**Resultado:** Os dois talentos principais agora aparecem lado a lado, com texto justificado.

---

### ✅ 2. Geração de PDF

**Problema:** Erro do React "Minified React error #321" ao tentar gerar PDF.

**Causa:** O hook `useMutation()` estava sendo chamado dentro de uma função assíncrona (`handleDownloadPDF`), violando as regras dos React Hooks.

**Solução:** Movido o hook para o topo do componente:

```tsx
// No topo do componente
const generatePdfMutation = trpc.pdf.generate.useMutation();

// Na função handleDownloadPDF
const response = await generatePdfMutation.mutateAsync({ traineeId });
```

**Resultado:** PDF agora é gerado e baixado corretamente sem erros.

---

### ✅ 3. Centralização do Formulário Inicial

**Problema:** Labels "Seu Nome" e "WhatsApp" estavam alinhados à esquerda.

**Solução:** Alterado `textAlign` de `'left'` para `'center'` nos estilos dos labels:

```tsx
<label style={{ 
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--text-dark)',
  textAlign: 'center'  // ← Alterado aqui
}}>
```

**Resultado:** Labels agora estão centralizados no formulário inicial.

---

### ✅ 4. Integração com Google Sheets

**Problema:** Resultados não eram enviados para o Google Sheets.

**Solução:** 

1. **Backend:** Criado endpoint `sendToSheets` em `server/routers.ts`:
   - Busca os resultados do trainee
   - Prepara os dados no formato esperado pelo Google Apps Script
   - Envia via POST para a URL configurada

2. **Frontend:** Adicionado `useEffect` em `renderResults()`:
   - Envia automaticamente quando os resultados são exibidos
   - Usa o hook `sendToSheetsMutation` criado no topo do componente

**Código do endpoint:**
```typescript
sendToSheets: publicProcedure
  .input(z.object({ traineeId: z.string() }))
  .mutation(async ({ input }) => {
    const result = await getResult(input.traineeId);
    const trainee = await getTrainee(input.traineeId);
    
    const sheetData = {
      name: trainee.name,
      whatsapp: trainee.whatsapp,
      talents: [
        { name: result.genius1 },
        { name: result.genius2 },
      ],
      weaknesses: [
        { name: result.frustration1 },
        { name: result.frustration2 },
      ],
      tendency: result.dominantTendency,
    };

    await fetch(process.env.GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetData),
    });
  })
```

---

## Configuração Necessária no Railway

Para que a integração com Google Sheets funcione, você precisa adicionar uma variável de ambiente:

### Passo 1: Configurar Google Apps Script

1. Abra sua planilha do Google Sheets
2. Vá em **Extensões → Apps Script**
3. Cole o código do arquivo `google-apps-script.js` (disponível no projeto)
4. Clique em **Implantar → Nova implantação**
5. Tipo: **"Aplicativo da Web"**
6. Executar como: **"Eu"**
7. Quem tem acesso: **"Qualquer pessoa"**
8. Copie a **URL gerada** (algo como: `https://script.google.com/macros/s/...`)

### Passo 2: Configurar no Railway

1. Vá no serviço principal no Railway
2. Aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Nome: `GOOGLE_SHEETS_URL`
5. Valor: Cole a URL copiada do Google Apps Script
6. Salve

### Passo 3: Redeploy

O Railway fará redeploy automático. Após isso, todos os resultados serão enviados automaticamente para o Google Sheets!

---

## Estrutura da Planilha

O Google Sheets terá as seguintes colunas:

| Data/Hora | Nome | WhatsApp | Talento 1 | Talento 2 | Ponto de Melhoria 1 | Ponto de Melhoria 2 | Tendência Dominante |
|-----------|------|----------|-----------|-----------|---------------------|---------------------|---------------------|

Os dados são inseridos automaticamente quando o usuário visualiza seus resultados.

---

## Arquivos Modificados

1. `client/src/pages/Game.tsx`
   - Adicionado hooks `generatePdfMutation` e `sendToSheetsMutation`
   - Corrigido `handleDownloadPDF`
   - Centralizado labels do formulário
   - Modificado `renderResults` para layout de duas colunas
   - Adicionado `useEffect` para envio automático ao Google Sheets

2. `server/routers.ts`
   - Adicionado endpoint `sendToSheets`

---

## Testado e Funcionando ✅

Todas as correções foram aplicadas e testadas:
- ✅ Layout de duas colunas renderizando corretamente
- ✅ PDF sendo gerado sem erros
- ✅ Labels centralizados no formulário
- ✅ Endpoint de Google Sheets criado e pronto para uso

**Próximo passo:** Configurar a variável `GOOGLE_SHEETS_URL` no Railway conforme instruções acima.

