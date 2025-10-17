import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Problem from "../models/problem.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");
dotenv.config({ path: path.join(rootDir, ".env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/oj";

async function run() {
    try {
        const dataPath = path.join(rootDir, "src", "problemsData.json");
        const raw = fs.readFileSync(dataPath, "utf-8");
        const problems = JSON.parse(raw);

        await mongoose.connect(mongoUri);
        console.log("Connected:", mongoUri);

        // Insert with upsert-like behavior by title to avoid duplicates on re-run
        for (const p of problems) {
            await Problem.updateOne(
                { title: p.title },
                { $setOnInsert: p },
                { upsert: true }
            );
            console.log(`Seeded: ${p.title}`);
        }

        console.log("Done seeding problems.");
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Seeder error:", err);
        process.exit(1);
    }
}

run();


