/**
 * STL Processing API Endpoint
 * Handles STL uploads, scaling, and validation
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  processAndScaleSTL,
  calculateDimensionsFromBuffer,
  validateSTLFile,
  normalizeSTLUnits,
} from "@/lib/stl-processor";
import { validateModelSize, DEFAULT_BUILD_VOLUME } from "@/lib/stl-utils";
import type {
  STLProcessingRequest,
  STLProcessingResponse,
  ModelDimensions,
} from "@/types/model";

/**
 * POST - Process and scale STL file
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: STLProcessingRequest = await request.json();
    const { modelId, scaleFactor, targetDimensions, lockAspectRatio } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 },
      );
    }

    // Fetch model from database
    const { data: model, error: modelError } = await supabase
      .from("models")
      .select("*")
      .eq("id", modelId)
      .eq("user_id", user.id)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Download original STL from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("models")
      .download(model.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: "Failed to download model file" },
        { status: 500 },
      );
    }

    // Convert to ArrayBuffer
    const originalBuffer = await fileData.arrayBuffer();

    // Validate STL
    const validation = await validateSTLFile(originalBuffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Invalid STL file: ${validation.error}` },
        { status: 400 },
      );
    }

    // Normalize units (convert from inches if needed)
    const { buffer: normalizedBuffer, scaleFactor: unitScaleFactor } =
      await normalizeSTLUnits(originalBuffer);

    // Calculate final scale factor
    let finalScaleFactor = scaleFactor * unitScaleFactor;

    // If target dimensions provided, calculate scale factor
    if (targetDimensions && lockAspectRatio) {
      const originalDims =
        await calculateDimensionsFromBuffer(normalizedBuffer);
      // Use X dimension as reference
      finalScaleFactor = targetDimensions.x / originalDims.x;
    }

    // Apply scaling
    const scaledBuffer = await processAndScaleSTL(
      normalizedBuffer,
      finalScaleFactor,
    );

    // Calculate final dimensions
    const finalDimensions = await calculateDimensionsFromBuffer(scaledBuffer);

    // Validate against build volume
    const validationResult = validateModelSize(
      finalDimensions,
      DEFAULT_BUILD_VOLUME,
    );

    // Upload scaled STL to storage
    const timestamp = Date.now();
    const scaledFileName = `${user.id}/${timestamp}_scaled_${model.filename}`;

    const { error: uploadError } = await supabase.storage
      .from("models")
      .upload(scaledFileName, scaledBuffer, {
        contentType: "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload scaled file:", uploadError);
      return NextResponse.json(
        { error: "Failed to save scaled model" },
        { status: 500 },
      );
    }

    // Update model record
    const { error: updateError } = await supabase
      .from("models")
      .update({
        scaled_file_path: scaledFileName,
        final_dimensions: finalDimensions,
        scale_factor: finalScaleFactor,
        validation: validationResult,
        updated_at: new Date().toISOString(),
      })
      .eq("id", modelId);

    if (updateError) {
      console.error("Failed to update model record:", updateError);
    }

    const response: STLProcessingResponse = {
      success: true,
      scaledFilePath: scaledFileName,
      finalDimensions,
      appliedScaleFactor: finalScaleFactor,
      validation: validationResult,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("STL processing error:", error);
    return NextResponse.json(
      { error: error.message || "Processing failed" },
      { status: 500 },
    );
  }
}

/**
 * GET - Get model dimensions without scaling
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 },
      );
    }

    // Fetch model from database
    const { data: model, error: modelError } = await supabase
      .from("models")
      .select("*")
      .eq("id", modelId)
      .eq("user_id", user.id)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Download STL from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("models")
      .download(model.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: "Failed to download model file" },
        { status: 500 },
      );
    }

    // Convert to ArrayBuffer
    const buffer = await fileData.arrayBuffer();

    // Calculate dimensions
    const dimensions = await calculateDimensionsFromBuffer(buffer);

    // Validate
    const validation = validateModelSize(dimensions, DEFAULT_BUILD_VOLUME);

    return NextResponse.json({
      dimensions,
      validation,
    });
  } catch (error: any) {
    console.error("Dimension calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate dimensions" },
      { status: 500 },
    );
  }
}
