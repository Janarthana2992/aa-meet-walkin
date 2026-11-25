import { NextRequest, NextResponse } from "next/server";
import { importController } from "@/server/controllers/import.controller";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const result = await importController.handleListMembers({
    search: searchParams.get("search") || undefined,
    membershipType: searchParams.get("membershipType") || undefined,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    let csvText = "";
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file instanceof File) {
        csvText = await file.text();
      } else if (typeof formData.get("csvText") === "string") {
        csvText = formData.get("csvText") as string;
      }
    } else {
      const body = await req.json();
      csvText = body.csvText || "";
    }

    const result = await importController.handleImportMembersCsv(csvText);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to import association members CSV";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
