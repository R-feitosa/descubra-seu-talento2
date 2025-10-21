import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import "../modern-theme.css";

// pdfMake é carregado via CDN no index.html
// @ts-ignore
declare const pdfMake: any;

type GameState = "menu" | "prologue" | "welcome" | "phase" | "feedback" | "results";

// Mapeamento de imagens dos talentos
const talentImages: Record<string, string> = {
  "Reflexão": "/talento-raciocinio.png",
  "Invenção": "/talento-invencao.png",
  "Discernimento": "/talento-discernimento.png",
  "Arrebatamento": "/talento-arrebatamento.png",
  "Facilitação": "/talento-facilitacao.png",
  "Tenacidade": "/talento-tenacidade.png",
};

// Mapeamento de cenários com personagens integrados por fase
// Fase 1-3: Dra. Flávia (Cível, Trabalhista, Previdenciário)
// Fase 4: Dra. Leandra (Controladoria)
// Fase 5: Dr. Anderson (Planejamento & Desenvolvimento)
// Fase 6: Jânio Edson (Marketing)
const phaseScenes: Record<number, string> = {
  1: "/fase1-flavia.png",      // Cível - Dra. Flávia
  2: "/fase1-flavia.png",      // Trabalhista - Dra. Flávia
  3: "/fase1-flavia.png",      // Previdenciário - Dra. Flávia
  4: "/fase4-leandra.png",     // Controladoria - Dra. Leandra
  5: "/fase5-anderson.png",    // Planejamento & Desenvolvimento - Dr. Anderson
  6: "/fase6-janio.png",       // Marketing - Jânio Edson
};

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [traineeId, setTraineeId] = useState<string>("");
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [currentDilemma, setCurrentDilemma] = useState<number>(0);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const startGameMutation = trpc.game.start.useMutation();
  const submitAnswerMutation = trpc.game.submitAnswer.useMutation();
  const generatePdfMutation = trpc.pdf.generate.useMutation();
  const sendToSheetsMutation = trpc.game.sendToSheets.useMutation();
  
  const { data: phaseData, refetch: refetchPhase } = trpc.game.getPhase.useQuery(
    { traineeId, phase: currentPhase },
    { enabled: (gameState === "phase" || gameState === "welcome") && !!traineeId }
  );

  const { data: resultsData } = trpc.game.getResults.useQuery(
    { traineeId },
    { enabled: gameState === "results" && !!traineeId }
  );

  // Enviar para Google Sheets quando os resultados forem carregados
  useEffect(() => {
    if (gameState === "results" && traineeId && resultsData) {
      sendToSheetsMutation.mutateAsync({ traineeId }).catch(console.error);
    }
  }, [gameState, traineeId, resultsData]);

  const handleStartGame = async () => {
    if (!name || !whatsapp) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    if (whatsapp.length < 10) {
      alert("WhatsApp deve ter pelo menos 10 dígitos (ex: 11999887766)");
      return;
    }

    try {
      const result = await startGameMutation.mutateAsync({ name, whatsapp });
      setTraineeId(result.traineeId);
      setGameState("prologue");
    } catch (error: any) {
      const errorMessage = error?.message || "Erro ao iniciar o jogo. Tente novamente.";
      alert(errorMessage);
    }
  };

  const handleAnswer = async (optionIndex: number) => {
    if (!phaseData || !traineeId) return;

    const selectedOption = phaseData.dilemas[currentDilemma].opcoes[optionIndex];
    
    try {
      const result = await submitAnswerMutation.mutateAsync({
        traineeId,
        phase: currentPhase,
        dilemmaIndex: currentDilemma,
        selectedOption: optionIndex,
        scoresAwarded: selectedOption.scores,
      });

      if (result.phaseCompleted) {
        if (result.nextPhase === 7) {
          setGameState("feedback");
        } else if (result.nextPhase) {
          setCurrentPhase(result.nextPhase);
          setCurrentDilemma(0);
          setGameState("welcome"); // Mostrar tela de boas-vindas antes da próxima fase
          await refetchPhase();
        }
      } else {
        setCurrentDilemma(currentDilemma + 1);
      }
    } catch (error) {
      alert("Erro ao registrar resposta. Tente novamente.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultsData || !traineeId) return;
    
    try {
      console.log('Gerando PDF via backend...');
      
      // Chamar endpoint backend para gerar PDF
      const response = await generatePdfMutation.mutateAsync({ traineeId });
      
      if (response.success && response.pdf) {
        // Converter base64 para blob e baixar
        const byteCharacters = atob(response.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Criar link de download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('PDF baixado com sucesso!');
      } else {
        throw new Error('Falha ao gerar PDF');
      }
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${error.message || 'Tente novamente'}`);
    }
  };

  const renderMenu = () => (
    <div className="menu-screen fade-in">
      <img 
        src="/recepcao-final.png" 
        alt="Recepção" 
        className="scene-background"
      />
      
      <div className="menu-content">
        <h1 className="menu-title" style={{ 
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '24px',
          fontWeight: '400',
          letterSpacing: '1px',
          textShadow: '3px 3px 0px rgba(0,0,0,0.3)',
          marginBottom: '15px',
          lineHeight: '1.4',
          color: '#800020'
        }}>
          Descubra seu Talento
        </h1>
        <p className="menu-subtitle" style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '14px',
          fontWeight: '400',
          color: 'var(--text-dark)',
          marginBottom: '25px',
          lineHeight: '1.5',
          letterSpacing: '1px'
        }}>
          RFeitosa Advogados Associados
        </p>
        
        <p className="menu-description" style={{ marginBottom: '30px' }}>
          Bem-vindo ao programa de trainee! Vamos descobrir seus talentos profissionais 
          através de uma jornada de 6 semanas no escritório.
        </p>
        
        <div className="menu-form">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-dark)',
              textAlign: 'center'
            }}>
              Seu Nome
            </label>
            <input
              type="text"
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="menu-input"
              style={{
                padding: '14px 18px',
                fontSize: '16px',
                border: '2px solid var(--primary)',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-dark)',
              textAlign: 'center'
            }}>
              WhatsApp
            </label>
            <input
              type="tel"
              placeholder="Ex: 11999887766"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="menu-input"
              style={{
                padding: '14px 18px',
                fontSize: '16px',
                border: '2px solid var(--primary)',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={handleStartGame}
            disabled={startGameMutation.isPending}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            {startGameMutation.isPending ? "Iniciando..." : "▶ Iniciar Jogo"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrologue = () => (
    <div className="scene-container fade-in">
      <img 
        src="/prologo-roneely.png" 
        alt="Dr. Roneely na Recepção" 
        className="scene-background-full"
      />
      
      <div className="dialog-box">
        <div className="dialog-header">
          <span className="dialog-speaker">Dr. Roneely Feitosa</span>
          <span className="dialog-badge">Sócio Fundador</span>
        </div>
        
        <div className="dialog-text">
          <p style={{ marginBottom: '15px' }}>
            Olá, <strong>{name}</strong>! Seja bem-vindo ao RFeitosa Advogados Associados. Nosso lema é <strong>SERVIR</strong>.
          </p>
          <p style={{ marginBottom: '15px' }}>
            Nas próximas 6 semanas, você vai trabalhar em diferentes setores do nosso escritório. Cada experiência revelará seus talentos naturais.
          </p>
          <p>
            Ao final, nossa gerente de RH, Renata, vai apresentar seus resultados e orientações de carreira.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrentPhase(1);
            setGameState("welcome");
          }}
        >
          ▶ Começar Programa
        </button>
      </div>
    </div>
  );

  const renderWelcome = () => {
    if (!phaseData) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', fontSize: '16px' }}>Carregando...</p>
        </div>
      );
    }

    const sceneImage = phaseScenes[currentPhase];
    
    // Mensagens de boas-vindas personalizadas por setor
    const welcomeMessages: Record<number, { greeting: string; description: string }> = {
      1: {
        greeting: `Olá, ${name}! Seja bem-vindo ao setor Cível!`,
        description: "Aqui você vai lidar com casos que envolvem relações entre pessoas e empresas. Vamos ver como você se sai!"
      },
      2: {
        greeting: `Bem-vindo de volta, ${name}! Agora você está no Trabalhista!`,
        description: "Neste setor, tratamos de questões relacionadas às relações de trabalho. Prepare-se para novos desafios!"
      },
      3: {
        greeting: `Olá, ${name}! Vamos trabalhar com Previdenciário agora!`,
        description: "Aqui cuidamos de benefícios previdenciários e aposentadorias. Cada caso é único e importante!"
      },
      4: {
        greeting: `Prazer em conhecê-lo, ${name}! Sou a Dra. Leandra, da Controladoria.`,
        description: "Neste setor, analisamos números, dados e indicadores. Vamos ver seu lado analítico!"
      },
      5: {
        greeting: `E aí, ${name}! Sou o Dr. Anderson, do Planejamento & Desenvolvimento.`,
        description: "Aqui pensamos no futuro do escritório, inovação e tecnologia. Pronto para criar o novo?"
      },
      6: {
        greeting: `Fala, ${name}! Eu sou o Jânio Edson, do Marketing!`,
        description: "Vamos trabalhar com comunicação, marca e relacionamento com clientes. Hora de brilhar!"
      }
    };

    const welcome = welcomeMessages[currentPhase];

    return (
      <div className="scene-container fade-in">
        <img 
          src={sceneImage} 
          alt="Cenário" 
          className="scene-background-full"
        />
        
        <div className="dialog-box">
          <div className="dialog-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary-dark)' }}>
                {phaseData.setor}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="dialog-speaker">{phaseData.supervisor}</span>
                <span className="dialog-badge">Semana {currentPhase}/6</span>
              </div>
            </div>
          </div>

          <div className="dialog-text">
            <p style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>
              {welcome.greeting}
            </p>
            <p style={{ marginBottom: '15px' }}>
              {welcome.description}
            </p>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => setGameState("phase")}
          >
            ▶ Começar Semana {currentPhase}
          </button>
        </div>
      </div>
    );
  };

  const renderPhase = () => {
    if (!phaseData) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', fontSize: '16px' }}>Carregando fase...</p>
        </div>
      );
    }

    const dilema = phaseData.dilemas[currentDilemma];
    const sceneImage = phaseScenes[currentPhase];

    return (
      <div className="scene-container fade-in">
        <img 
          src={sceneImage} 
          alt="Cenário" 
          className="scene-background-full"
        />
        
        <div className="dialog-box">
          <div className="dialog-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary-dark)' }}>
                {phaseData.setor}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="dialog-speaker">{phaseData.supervisor}</span>
                <span className="dialog-badge">Semana {currentPhase}/6</span>
                <span className="dialog-badge">Situação {currentDilemma + 1}/4</span>
              </div>
            </div>
          </div>
          
          <div className="dialog-text">
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>{dilema.contexto || dilema.desafio}</p>
          </div>

          <div className="options-container">
            {dilema.opcoes.map((opcao, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => handleAnswer(index)}
                disabled={submitAnswerMutation.isPending}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{opcao.texto}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => (
    <div className="scene-container fade-in">
      <img 
        src="/feedback-renata.png" 
        alt="Renata - Gerente de RH" 
        className="scene-background-full"
      />
      
      <div className="dialog-box">
        <div className="dialog-header">
          <span className="dialog-speaker">Renata</span>
          <span className="dialog-badge">Gerente de RH</span>
        </div>
        
        <div className="dialog-text">
          <p style={{ marginBottom: '15px' }}>
            Parabéns, <strong>{name}</strong>! Você completou as 6 semanas do programa de trainee!
          </p>
          <p style={{ marginBottom: '15px' }}>
            Durante esse período, observamos suas escolhas e identificamos seus talentos profissionais naturais.
          </p>
          <p>
            Agora vamos revelar seus talentos profissionais e como você pode utilizá-los da melhor forma!
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setGameState("results")}
        >
          ▶ Ver Resultados
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!resultsData) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', fontSize: '16px' }}>Calculando resultados...</p>
        </div>
      );
    }

    return (
      <div className="results-container fade-in">
        <h2 className="results-title">Seus Resultados</h2>
        
        <div className="result-card">
          <h3 className="result-card-title">
            <span>🌟</span> Seus Talentos Profissionais
          </h3>
          <p style={{ fontSize: '15px', marginBottom: '20px', lineHeight: '1.7', color: 'var(--text-dark)' }}>
            Com base nas suas escolhas durante o programa de trainee, identificamos seus dois principais <strong>Talentos Profissionais</strong> - as atividades que você realiza com naturalidade e que te energizam.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {resultsData.geniuses.map((genius, index) => (
              <div key={index} className="talent-item" style={{ gridColumn: index === 0 ? '1' : '2' }}>
                {talentImages[genius.name] && (
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <img 
                      src={talentImages[genius.name]} 
                      alt={genius.name}
                      style={{ 
                        maxWidth: '200px', 
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                )}
                <div className="talent-name">
                  {genius.name}
                </div>
                <div className="talent-description" style={{ textAlign: 'justify' }}>
                  {genius.detailedDescription || genius.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="result-card">
          <h3 className="result-card-title">
            <span>⚠️</span> Pontos de Melhoria
          </h3>
          <p style={{ fontSize: '15px', marginBottom: '20px', lineHeight: '1.7', color: 'var(--text-dark)' }}>
            Estes são os talentos que você menos pontuou. Considere desenvolver essas áreas ou trabalhar com pessoas que tenham esses talentos naturalmente.
          </p>
          {resultsData.improvements.map((improvement, index) => (
            <div key={index} className="talent-item">
              <div className="talent-name">
                {improvement.name}
              </div>
              <div className="talent-description">
                {improvement.description}
              </div>
            </div>
          ))}
        </div>

        <div className="result-card">
          <h3 className="result-card-title">
            <span>📊</span> Tendência Dominante
          </h3>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary-dark)' }}>
            {resultsData.dominantTendency}
          </p>
        </div>

        <div className="result-card">
          <h3 className="result-card-title">
            <span>💼</span> Conselho de Carreira
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {resultsData.careerAdvice.split('\n\n').map((paragraph, index) => (
              <p key={index} style={{ fontSize: '15px', marginBottom: '15px', lineHeight: '1.7' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleDownloadPDF}
          style={{ width: '100%', marginTop: '20px' }}
        >
          📥 Baixar Relatório
        </button>
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="game-screen">
        {gameState === "menu" && renderMenu()}
        {gameState === "prologue" && renderPrologue()}
        {gameState === "welcome" && renderWelcome()}
        {gameState === "phase" && renderPhase()}
        {gameState === "feedback" && renderFeedback()}
        {gameState === "results" && renderResults()}
      </div>
    </div>
  );
}

