import dotenv from "dotenv";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const [key, val] = argv[i].startsWith("--") ? argv[i].slice(2).split("=") : [null, null];
    if (key) args[key] = val ?? true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email;
  const id = args.id || args._id;
  const newPassword = args.password || args.pwd || args.pass;

  if (!email && !id) {
    console.error("❌ Missing --email or --id argument");
    process.exit(1);
  }
  if (!newPassword) {
    console.error("❌ Missing --password argument");
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";

  try {
    await connectDatabase(MONGODB_URI);

    const query = email ? { email } : { _id: id };
    const user = await User.findOne(query);
    if (!user) {
      console.error("❌ User not found for:", query);
      process.exit(1);
    }

    const hashed = await User.hashPassword(newPassword);
    user.passwordHash = hashed;
    await user.save();

    console.log(`✅ Password updated for user ${user.email || user._id}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to update password:", err.message);
    process.exit(1);
  }
}

main();


