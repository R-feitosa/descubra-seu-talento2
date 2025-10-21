import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Trainees table - stores participants of the talent discovery game
 */
export const trainees = mysqlTable("trainees", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  currentPhase: int("currentPhase").default(0).notNull(), // 0=menu, 1-6=phases, 7=feedback
  scoreR: int("scoreR").default(0).notNull(), // Reflexão
  scoreI: int("scoreI").default(0).notNull(), // Invenção
  scoreD: int("scoreD").default(0).notNull(), // Discernimento
  scoreA: int("scoreA").default(0).notNull(), // Arrebatamento
  scoreF: int("scoreF").default(0).notNull(), // Facilitação
  scoreT: int("scoreT").default(0).notNull(), // Tenacidade
  completed: int("completed").default(0).notNull(), // 0=incomplete, 1=complete
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Trainee = typeof trainees.$inferSelect;
export type InsertTrainee = typeof trainees.$inferInsert;

/**
 * Answers table - stores each answer given by trainees
 */
export const answers = mysqlTable("answers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  traineeId: varchar("traineeId", { length: 64 }).notNull(),
  phase: int("phase").notNull(), // 1-6
  dilemmaIndex: int("dilemmaIndex").notNull(), // 0-3 (4 dilemas por fase)
  selectedOption: int("selectedOption").notNull(), // 0-3 (4 opções por dilema)
  scoresAwarded: json("scoresAwarded").$type<Record<string, number>>().notNull(), // {"R": 5, "I": 3, ...}
  answeredAt: timestamp("answeredAt").defaultNow(),
});

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = typeof answers.$inferInsert;

/**
 * Results table - stores final calculated results
 */
export const results = mysqlTable("results", {
  id: varchar("id", { length: 64 }).primaryKey(),
  traineeId: varchar("traineeId", { length: 64 }).notNull().unique(),
  genius1: varchar("genius1", { length: 1 }).notNull(), // R, I, D, A, F, T
  genius2: varchar("genius2", { length: 1 }).notNull(),
  frustration1: varchar("frustration1", { length: 1 }).notNull(),
  frustration2: varchar("frustration2", { length: 1 }).notNull(),
  dominantTendency: varchar("dominantTendency", { length: 20 }).notNull(), // "Flexível" ou "Técnica"
  avgR: int("avgR").notNull(), // média * 100 para evitar decimais
  avgI: int("avgI").notNull(),
  avgD: int("avgD").notNull(),
  avgA: int("avgA").notNull(),
  avgF: int("avgF").notNull(),
  avgT: int("avgT").notNull(),
  careerAdvice: text("careerAdvice").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Result = typeof results.$inferSelect;
export type InsertResult = typeof results.$inferInsert;

