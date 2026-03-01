import { getAllSearchData } from "@/lib/mdx";

export async function GET() {
  const data = getAllSearchData();
  return Response.json(data);
}
