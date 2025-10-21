import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, trainees, answers, results, Trainee, InsertTrainee, Answer, InsertAnswer, Result, InsertResult } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== TRAINEE FUNCTIONS ====================

export async function createTrainee(data: InsertTrainee): Promise<Trainee> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(trainees).values(data);
  const result = await db.select().from(trainees).where(eq(trainees.id, data.id)).limit(1);
  
  if (result.length === 0) throw new Error("Failed to create trainee");
  return result[0];
}

export async function getTrainee(id: string): Promise<Trainee | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(trainees).where(eq(trainees.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTraineePhase(id: string, phase: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(trainees).set({ currentPhase: phase }).where(eq(trainees.id, id));
}

export async function updateTraineeScores(id: string, scores: Record<string, number>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};
  if (scores.R !== undefined) updateData.scoreR = scores.R;
  if (scores.I !== undefined) updateData.scoreI = scores.I;
  if (scores.D !== undefined) updateData.scoreD = scores.D;
  if (scores.A !== undefined) updateData.scoreA = scores.A;
  if (scores.F !== undefined) updateData.scoreF = scores.F;
  if (scores.T !== undefined) updateData.scoreT = scores.T;

  await db.update(trainees).set(updateData).where(eq(trainees.id, id));
}

export async function completeTrainee(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(trainees).set({ 
    completed: 1, 
    completedAt: new Date() 
  }).where(eq(trainees.id, id));
}

export async function getAllTrainees(): Promise<Trainee[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(trainees);
}

// ==================== ANSWER FUNCTIONS ====================

export async function createAnswer(data: InsertAnswer): Promise<Answer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(answers).values(data);
  const result = await db.select().from(answers).where(eq(answers.id, data.id)).limit(1);
  
  if (result.length === 0) throw new Error("Failed to create answer");
  return result[0];
}

export async function getTraineeAnswers(traineeId: string): Promise<Answer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(answers).where(eq(answers.traineeId, traineeId));
}

// ==================== RESULT FUNCTIONS ====================

export async function createResult(data: InsertResult): Promise<Result> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(results).values(data);
  const result = await db.select().from(results).where(eq(results.id, data.id)).limit(1);
  
  if (result.length === 0) throw new Error("Failed to create result");
  return result[0];
}

export async function getResult(traineeId: string): Promise<Result | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(results).where(eq(results.traineeId, traineeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

