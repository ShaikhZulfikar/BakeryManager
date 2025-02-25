import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set!");
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create the connection
const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
