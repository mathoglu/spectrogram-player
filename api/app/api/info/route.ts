import { isUrlValid } from "@/app/utils/url-validator";
import ytdl from "ytdl-core";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export const runtime = "nodejs";

export async function GET() {
  return Response.json({});
}

export async function POST(req: Request) {
  const { url } = await req.json();
  if (!isUrlValid(url)) {
    return Response.json({ error: "Invalid URL" }, { status: 403 });
  }
  const { videoDetails } = await ytdl.getInfo(url);
  return Response.json({ title: videoDetails.title });
}
