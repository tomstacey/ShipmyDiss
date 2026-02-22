import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractText, ExtractError } from "@/lib/document/extract-text";
import { analyseDocument } from "@/lib/ai/document-analyser";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data. Send multipart/form-data with a 'file' field." },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const projectId = formData.get("projectId") as string | null;
  const projectType = formData.get("projectType") as string | null;
  const title = formData.get("title") as string | null;

  // Extract text from the document
  let text: string;
  try {
    text = await extractText(file);
  } catch (err) {
    if (err instanceof ExtractError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }

  // Run AI analysis
  let analysis;
  try {
    analysis = await analyseDocument(text, {
      projectType: projectType ?? undefined,
      title: title ?? undefined,
    });
  } catch (err) {
    console.error("Document analysis failed:", err);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }

  // If projectId is provided, persist to the project (settings path)
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        documentAnalysis: JSON.parse(JSON.stringify(analysis)),
        documentFileName: file.name,
        documentAnalysedAt: new Date(),
      },
    });

    // Log the AI interaction
    await prisma.aIInteractionLog.create({
      data: {
        projectId,
        interactionType: "document_analysis",
        userInput: `Uploaded: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`,
        aiOutput: analysis.rawSummary,
      },
    });
  }

  return NextResponse.json({
    analysis,
    fileName: file.name,
  });
}
