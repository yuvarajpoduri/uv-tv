import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

async function seed() {
  await connectDB();

  const username = (process.env.USER_USERNAME || "uv").toLowerCase().trim();
  const rawPassword = process.env.USER_PASSWORD || "uvpass";
  const displayName = process.env.USER_NAME || "uv";

  let existing = await User.findOne({ username });
  if (existing) {
    console.log(`User '${username}' already exists. Seed skipped.`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(rawPassword, salt);

  await User.create({
    username,
    passwordHash,
    displayName
  });

  console.log(`Successfully created single user '${username}' for uv.tv!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
