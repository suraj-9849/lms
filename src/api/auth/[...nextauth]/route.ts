import { NextApiRequest, NextApiResponse } from "next";
import { authHandler } from "@/auth";

// Handle GET :
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  return authHandler;
}

// Handle POST L
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  return authHandler;
}
