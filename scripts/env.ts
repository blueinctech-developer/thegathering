/** Load .env.local, then .env (same order as Next.js), for command-line scripts. */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
