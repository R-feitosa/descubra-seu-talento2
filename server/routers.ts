import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  createTrainee, 
  getTrainee, 
  updateTraineePhase, 
  updateTraineeScores,
  completeTrainee,
  getAllTrainees,
  createAnswer,
  getTraineeAnswers,
  createResult,
  getResult
} from "./db";
import { randomBytes } from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, unlink } from "fs/promises";
import talentosData from "../shared/talentos.json";
import conselhosData from "../shared/conselhos.json";
import dilemasData from "../shared/dilemas.json";
import tendenciasData from "../shared/tendencias.json";

const execAsync = promisify(exec);

// Helper para gerar IDs únicos
function generateId() {
  return randomBytes(16).toString("hex");
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  game: router({
    // Iniciar novo jogo
    start: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos (ex: 11999887766)"),
      }))
      .mutation(async ({ input }) => {
        const traineeId = generateId();
        
        const trainee = await createTrainee({
          id: traineeId,
          name: input.name,
          whatsapp: input.whatsapp,
          currentPhase: 0,
          scoreR: 0,
          scoreI: 0,
          scoreD: 0,
          scoreA: 0,
          scoreF: 0,
          scoreT: 0,
          completed: 0,
        });

        return {
          traineeId: trainee.id,
          message: "Jogo iniciado com sucesso!",
        };
      }),

    // Obter dados da fase
    getPhase: publicProcedure
      .input(z.object({
        traineeId: z.string(),
        phase: z.number().min(1).max(6),
      }))
      .query(async ({ input }) => {
        const trainee = await getTrainee(input.traineeId);
        if (!trainee) {
          throw new Error("Trainee não encontrado");
        }

        // Buscar dados da fase
        const faseData = dilemasData.fases.find(f => f.fase === input.phase);
        if (!faseData) {
          throw new Error("Fase não encontrada");
        }

        // Selecionar apenas 3 dilemas aleatórios da fase
        const shuffledDilemas = [...faseData.dilemas].sort(() => Math.random() - 0.5);
        const selectedDilemas = shuffledDilemas.slice(0, 3);

        return {
          fase: faseData.fase,
          setor: faseData.setor,
          supervisor: faseData.supervisor,
          cenario: faseData.cenario,
          dilemas: selectedDilemas,
          trainee: {
            name: trainee.name,
            currentPhase: trainee.currentPhase,
          },
        };
      }),

    // Registrar resposta
    submitAnswer: publicProcedure
      .input(z.object({
        traineeId: z.string(),
        phase: z.number().min(1).max(6),
        dilemmaIndex: z.number().min(0).max(3),
        selectedOption: z.number().min(0).max(3),
        scoresAwarded: z.record(z.string(), z.number()),
      }))
      .mutation(async ({ input }) => {
        const trainee = await getTrainee(input.traineeId);
        if (!trainee) {
          throw new Error("Trainee não encontrado");
        }

        // Registrar resposta
        await createAnswer({
          id: generateId(),
          traineeId: input.traineeId,
          phase: input.phase,
          dilemmaIndex: input.dilemmaIndex,
          selectedOption: input.selectedOption,
          scoresAwarded: input.scoresAwarded,
        });

        // Atualizar pontuações do trainee
        const scores = input.scoresAwarded as Record<string, number>;
        const newScores = {
          R: trainee.scoreR + (scores['R'] || 0),
          I: trainee.scoreI + (scores['I'] || 0),
          D: trainee.scoreD + (scores['D'] || 0),
          A: trainee.scoreA + (scores['A'] || 0),
          F: trainee.scoreF + (scores['F'] || 0),
          T: trainee.scoreT + (scores['T'] || 0),
        };

        await updateTraineeScores(input.traineeId, newScores);

        // Verificar se completou a fase (4 dilemas)
        const answers = await getTraineeAnswers(input.traineeId);
        const answersInPhase = answers.filter(a => a.phase === input.phase);
        
        if (answersInPhase.length === 4) {
          // Avançar para próxima fase
          const nextPhase = input.phase + 1;
          await updateTraineePhase(input.traineeId, nextPhase);
          
          return {
            success: true,
            phaseCompleted: true,
            nextPhase: nextPhase <= 6 ? nextPhase : 7,
          };
        }

        return {
          success: true,
          phaseCompleted: false,
        };
      }),

    // Calcular e obter resultados finais
    getResults: publicProcedure
      .input(z.object({
        traineeId: z.string(),
      }))
      .query(async ({ input }) => {
        // Verificar se já existe resultado calculado
        let result = await getResult(input.traineeId);
        
        if (!result) {
          // Calcular resultados
          const trainee = await getTrainee(input.traineeId);
          if (!trainee) {
            throw new Error("Trainee não encontrado");
          }

          // Calcular médias (multiplicadas por 100 para evitar decimais)
          // Cada talento tem 12 oportunidades de pontuação (2 por fase x 6 fases)
          const avgR = Math.round((trainee.scoreR / 12) * 100);
          const avgI = Math.round((trainee.scoreI / 12) * 100);
          const avgD = Math.round((trainee.scoreD / 12) * 100);
          const avgA = Math.round((trainee.scoreA / 12) * 100);
          const avgF = Math.round((trainee.scoreF / 12) * 100);
          const avgT = Math.round((trainee.scoreT / 12) * 100);

          // Ordenar talentos por média
          const talentScores = [
            { talent: "R", avg: avgR },
            { talent: "I", avg: avgI },
            { talent: "D", avg: avgD },
            { talent: "A", avg: avgA },
            { talent: "F", avg: avgF },
            { talent: "T", avg: avgT },
          ].sort((a, b) => b.avg - a.avg);

          // Top 2 = Gênios, Bottom 2 = Frustrações
          const genius1 = talentScores[0].talent;
          const genius2 = talentScores[1].talent;
          const frustration1 = talentScores[4].talent;
          const frustration2 = talentScores[5].talent;

          // Calcular tendência dominante
          const avgFlexivel = Math.round(((avgR + avgI + avgA + avgF) / 4));
          const avgTecnica = Math.round(((avgD + avgT) / 2));
          const dominantTendency = avgFlexivel > avgTecnica ? "Flexível" : "Técnica";

          // Montar conselho de carreira
          const conselho1 = (conselhosData.conselhos as any)[genius1]?.conselho || "";
          const conselho2 = (conselhosData.conselhos as any)[genius2]?.conselho || "";
          const conselhoGeral = conselhosData.conselhosGerais.doisGenios;
          const conselhoTendencia = dominantTendency === "Flexível" 
            ? conselhosData.conselhosGerais.tendenciaFlexivel 
            : conselhosData.conselhosGerais.tendenciaTecnica;

          const careerAdvice = `${conselhoGeral}\n\n${conselho1}\n\n${conselho2}\n\n${conselhoTendencia}`;

          // Salvar resultado
          result = await createResult({
            id: generateId(),
            traineeId: input.traineeId,
            genius1,
            genius2,
            frustration1,
            frustration2,
            dominantTendency,
            avgR,
            avgI,
            avgD,
            avgA,
            avgF,
            avgT,
            careerAdvice,
          });

          // Marcar trainee como completo
          await completeTrainee(input.traineeId);
        }

        // Buscar dados do trainee e informações dos talentos
        const trainee = await getTrainee(input.traineeId);
        
        return {
          trainee: {
            name: trainee?.name,
            whatsapp: trainee?.whatsapp,
          },
          geniuses: [
            {
              code: result.genius1,
              name: (talentosData.talentos as any)[result.genius1]?.nome,
              description: (talentosData.talentos as any)[result.genius1]?.descricao,
              detailedDescription: (talentosData.talentos as any)[result.genius1]?.descricaoDetalhada,
            },
            {
              code: result.genius2,
              name: (talentosData.talentos as any)[result.genius2]?.nome,
              description: (talentosData.talentos as any)[result.genius2]?.descricao,
              detailedDescription: (talentosData.talentos as any)[result.genius2]?.descricaoDetalhada,
            },
          ],
          improvements: [
            {
              code: result.frustration1,
              name: (talentosData.talentos as any)[result.frustration1]?.nome,
              description: (talentosData.talentos as any)[result.frustration1]?.descricao,
            },
            {
              code: result.frustration2,
              name: (talentosData.talentos as any)[result.frustration2]?.nome,
              description: (talentosData.talentos as any)[result.frustration2]?.descricao,
            },
          ],
          dominantTendency: result.dominantTendency,
          tendencyDescription: (tendenciasData.tendencias as any)[result.dominantTendency]?.descricao || '',
          averages: {
            R: result.avgR / 100,
            I: result.avgI / 100,
            D: result.avgD / 100,
            A: result.avgA / 100,
            F: result.avgF / 100,
            T: result.avgT / 100,
          },
          careerAdvice: result.careerAdvice,
        };
      }),

    // Obter status do trainee
    getStatus: publicProcedure
      .input(z.object({
        traineeId: z.string(),
      }))
      .query(async ({ input }) => {
        const trainee = await getTrainee(input.traineeId);
        if (!trainee) {
          throw new Error("Trainee não encontrado");
        }

        const answers = await getTraineeAnswers(input.traineeId);

        return {
          name: trainee.name,
          currentPhase: trainee.currentPhase,
          completed: trainee.completed === 1,
          totalAnswers: answers.length,
        };
      }),
  }),

  admin: router({
    // Listar todos os trainees (protegido - apenas admin)
    listTrainees: protectedProcedure
      .query(async () => {
        const allTrainees = await getAllTrainees();
        
        return allTrainees.map(t => ({
          id: t.id,
          name: t.name,
          whatsapp: t.whatsapp,
          currentPhase: t.currentPhase,
          completed: t.completed === 1,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
          scores: {
            R: t.scoreR,
            I: t.scoreI,
            D: t.scoreD,
            A: t.scoreA,
            F: t.scoreF,
            T: t.scoreT,
          },
        }));
      }),

    // Obter detalhes de um trainee específico
    getTraineeDetails: protectedProcedure
      .input(z.object({
        traineeId: z.string(),
      }))
      .query(async ({ input }) => {
        const trainee = await getTrainee(input.traineeId);
        if (!trainee) {
          throw new Error("Trainee não encontrado");
        }

        const answers = await getTraineeAnswers(input.traineeId);
        const result = await getResult(input.traineeId);

        return {
          trainee: {
            id: trainee.id,
            name: trainee.name,
            whatsapp: trainee.whatsapp,
            currentPhase: trainee.currentPhase,
            completed: trainee.completed === 1,
            createdAt: trainee.createdAt,
            completedAt: trainee.completedAt,
            scores: {
              R: trainee.scoreR,
              I: trainee.scoreI,
              D: trainee.scoreD,
              A: trainee.scoreA,
              F: trainee.scoreF,
              T: trainee.scoreT,
            },
          },
          answers: answers.map(a => ({
            phase: a.phase,
            dilemmaIndex: a.dilemmaIndex,
            selectedOption: a.selectedOption,
            scoresAwarded: a.scoresAwarded,
            answeredAt: a.answeredAt,
          })),
          result: result ? {
            genius1: result.genius1,
            genius2: result.genius2,
            frustration1: result.frustration1,
            frustration2: result.frustration2,
            dominantTendency: result.dominantTendency,
            averages: {
              R: result.avgR / 100,
              I: result.avgI / 100,
              D: result.avgD / 100,
              A: result.avgA / 100,
              F: result.avgF / 100,
              T: result.avgT / 100,
            },
          } : null,
        };
      }),
  }),

  pdf: router({
    // Gerar PDF do relatório
    generate: publicProcedure
      .input(z.object({
        traineeId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const result = await getResult(input.traineeId);
        if (!result) {
          throw new Error("Resultado não encontrado");
        }

        const trainee = await getTrainee(input.traineeId);
        if (!trainee) {
          throw new Error("Trainee não encontrado");
        }

        // Preparar dados para o PDF
        const pdfData = {
          trainee: {
            name: trainee.name,
            whatsapp: trainee.whatsapp,
          },
          geniuses: [
            {
              name: result.genius1,
              description: (talentosData as any)[result.genius1]?.descricao || "",
            },
            {
              name: result.genius2,
              description: (talentosData as any)[result.genius2]?.descricao || "",
            },
          ],
          weaknesses: [
            {
              name: result.frustration1,
              description: (talentosData as any)[result.frustration1]?.descricaoBreve || "",
            },
            {
              name: result.frustration2,
              description: (talentosData as any)[result.frustration2]?.descricaoBreve || "",
            },
          ],
          tendency: result.dominantTendency,
          careerAdvice: (conselhosData as any)[result.genius1] || "",
        };

        // Gerar PDF usando Python
        const outputPath = `/tmp/relatorio_${input.traineeId}_${Date.now()}.pdf`;
        const jsonData = JSON.stringify(pdfData).replace(/'/g, "'\\''");
        
        try {
          await execAsync(
            `python3 server/generate_pdf.py '${jsonData}' '${outputPath}'`
          );

          // Ler PDF gerado
          const pdfBuffer = await readFile(outputPath);
          const base64Pdf = pdfBuffer.toString("base64");

          // Limpar arquivo temporário
          await unlink(outputPath);

          return {
            success: true,
            pdf: base64Pdf,
            filename: `relatorio-talentos-${trainee.name.replace(/\s+/g, "-")}.pdf`,
          };
        } catch (error: any) {
          console.error("Erro ao gerar PDF:", error);
          throw new Error(`Falha ao gerar PDF: ${error.message}`);
        }
      }),

    // Enviar resultados para Google Sheets (v2 - forçar rebuild)
    sendToSheets: publicProcedure
      .input(z.object({
        traineeId: z.string(),
      }))
      .mutation(async ({ input }) => {
        console.log("[Google Sheets] Iniciando envio para traineeId:", input.traineeId);
        
        const result = await getResult(input.traineeId);
        if (!result) {
          console.error("[Google Sheets] Resultado não encontrado para traineeId:", input.traineeId);
          throw new Error("Resultado não encontrado");
        }

        const trainee = await getTrainee(input.traineeId);
        if (!trainee) {
          console.error("[Google Sheets] Trainee não encontrado para traineeId:", input.traineeId);
          throw new Error("Trainee não encontrado");
        }

        // URL do Google Apps Script (configurar via variável de ambiente)
        const sheetsUrl = process.env.GOOGLE_SHEETS_URL;
        console.log("[Google Sheets] URL configurada:", sheetsUrl ? "SIM" : "NÃO");
        
        if (!sheetsUrl) {
          console.warn("[Google Sheets] GOOGLE_SHEETS_URL não configurada. Pulando envio.");
          return { success: false, message: "Google Sheets não configurado" };
        }

        // Preparar dados para enviar
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

        console.log("[Google Sheets] Dados preparados:", JSON.stringify(sheetData));

        try {
          console.log("[Google Sheets] Enviando para:", sheetsUrl);
          
          const response = await fetch(sheetsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sheetData),
          });

          console.log("[Google Sheets] Status da resposta:", response.status);
          
          const responseData = await response.json();
          console.log("[Google Sheets] Resposta:", JSON.stringify(responseData));
          
          if (responseData.success) {
            console.log("[Google Sheets] ✅ Dados enviados com sucesso!");
            return { success: true, message: "Dados enviados com sucesso" };
          } else {
            console.error("[Google Sheets] ❌ Erro na resposta:", responseData.error);
            return { success: false, message: responseData.error };
          }
        } catch (error: any) {
          console.error("[Google Sheets] ❌ Erro ao enviar:", error.message);
          return { success: false, message: error.message };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

