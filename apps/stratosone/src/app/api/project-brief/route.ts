import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "projectDescription",
      "projectStage",
      "areasOfHelp",
      "name",
      "email",
    ];

    for (const field of requiredFields) {
      if (
        !data[field] ||
        (Array.isArray(data[field]) && data[field].length === 0)
      ) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // TODO: Implement your data storage solution here
    // Options:
    // 1. Save to Supabase
    // 2. Send to your CRM (HubSpot, Notion, etc.)
    // 3. Send email via SendGrid/Resend/etc.
    // 4. Save to database

    // Example: Send notification email
    // await sendEmail({
    //   to: "hello@stratos.one",
    //   subject: `New Project Brief: ${data.projectStage}`,
    //   html: formatProjectBrief(data),
    // });

    // For now, just log the data
    console.log("New project brief submission:", {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(
      { success: true, message: "Project brief received" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing project brief:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}

// Helper function to format the project brief for email/storage
function formatProjectBrief(data: any): string {
  return `
    <h2>New Project Brief Submission</h2>
    
    <h3>Project Details</h3>
    <p><strong>Description:</strong><br>${data.projectDescription}</p>
    <p><strong>Stage:</strong> ${data.projectStage}</p>
    <p><strong>Areas of Help:</strong> ${data.areasOfHelp.join(", ")}</p>
    
    ${data.targetPlatforms.length > 0 ? `<p><strong>Target Platforms:</strong> ${data.targetPlatforms.join(", ")}</p>` : ""}
    ${data.budgetRange ? `<p><strong>Budget Range:</strong> ${data.budgetRange}</p>` : ""}
    ${data.timeline ? `<p><strong>Timeline:</strong> ${data.timeline}</p>` : ""}
    
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    ${data.companyOrLink ? `<p><strong>Company/Link:</strong> ${data.companyOrLink}</p>` : ""}
    
    <p><em>Submitted: ${new Date().toLocaleString()}</em></p>
  `;
}
