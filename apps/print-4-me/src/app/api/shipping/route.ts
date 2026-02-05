import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// DHL API Configuration
const DHL_API_URL = process.env.DHL_API_URL || "https://api-sandbox.dhl.com";
const DHL_API_KEY = process.env.DHL_API_KEY;
const DHL_ACCOUNT_NUMBER = process.env.DHL_ACCOUNT_NUMBER;

interface ShippingLabelRequest {
  orderId: string;
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  weight?: number; // in kg
}

function generateMockLabel() {
  const trackingNumber = `FF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return {
    trackingNumber,
    carrier: "DHL",
    labelUrl: `https://print-4-me.example.com/labels/${trackingNumber}.pdf`,
    estimatedDelivery: estimatedDelivery.toISOString(),
    mock: true,
  };
}

async function createDHLShipment(data: ShippingLabelRequest) {
  // If no DHL credentials, return mock
  if (!DHL_API_KEY || !DHL_ACCOUNT_NUMBER) {
    console.log("DHL credentials not configured, using mock");
    return generateMockLabel();
  }

  try {
    // DHL Shipment API call
    const shipmentResponse = await fetch(
      `${DHL_API_URL}/shipping/v1/shipments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(DHL_API_KEY).toString("base64")}`,
        },
        body: JSON.stringify({
          customerDetails: {
            shipperDetails: {
              postalAddress: {
                cityName: "Berlin",
                countryCode: "DE",
                postalCode: "10115",
                addressLine1: "Print-4-Me GmbH",
                addressLine2: "Musterstraße 123",
              },
              contactInformation: {
                companyName: "Print-4-Me 3D Printing",
                phone: "+49301234567",
              },
            },
            receiverDetails: {
              postalAddress: {
                cityName: data.city,
                countryCode: data.country,
                postalCode: data.postalCode,
                addressLine1: data.recipientName,
                addressLine2: data.street,
              },
              contactInformation: {
                fullName: data.recipientName,
              },
            },
          },
          content: {
            packages: [
              {
                weight: data.weight || 0.5,
                dimensions: {
                  length: 20,
                  width: 15,
                  height: 10,
                },
              },
            ],
            exportDeclaration: {
              exportReasonType: "permanent",
              invoiceDate: new Date().toISOString().split("T")[0],
              lineItems: [
                {
                  number: 1,
                  description: "3D Printed Parts",
                  quantity: 1,
                  quantityType: "PCS",
                  weight: data.weight || 0.5,
                  value: 0,
                  commodityCode: "3926909789",
                },
              ],
            },
          },
          accounts: [
            {
              typeCode: "shipper",
              number: DHL_ACCOUNT_NUMBER,
            },
          ],
          productCode: "P",
          outputImageProperties: {
            encodingFormat: "pdf",
            imageOptions: [
              {
                typeCode: "label",
              },
            ],
          },
        }),
      },
    );

    if (!shipmentResponse.ok) {
      const errorText = await shipmentResponse.text();
      console.error("DHL API error:", errorText);
      // Fall back to mock on error
      return generateMockLabel();
    }

    const shipmentData = await shipmentResponse.json();

    return {
      trackingNumber: shipmentData.shipmentTrackingNumber,
      carrier: "DHL",
      labelUrl: shipmentData.documents?.[0]?.url || null,
      estimatedDelivery: shipmentData.estimatedDeliveryDate,
      mock: false,
    };
  } catch (error) {
    console.error("DHL shipment creation error:", error);
    // Fall back to mock on error
    return generateMockLabel();
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 },
      );
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body: ShippingLabelRequest = await request.json();

    if (!body.orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", body.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create shipment label
    const labelResult = await createDHLShipment(body);

    // Update order with tracking info
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        tracking_number: labelResult.trackingNumber,
        label_url: labelResult.labelUrl,
      })
      .eq("id", body.orderId);

    if (updateError) {
      console.error("Failed to update order with tracking:", updateError);
    }

    return NextResponse.json({
      success: true,
      ...labelResult,
    });
  } catch (error: any) {
    console.error("Shipping label error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create shipping label" },
      { status: 500 },
    );
  }
}

// GET endpoint for tracking info
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackingNumber = searchParams.get("tracking");

  if (!trackingNumber) {
    return NextResponse.json(
      { error: "Tracking number required" },
      { status: 400 },
    );
  }

  // If mock tracking number
  if (trackingNumber.startsWith("FF")) {
    const mockEvents = [
      {
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        location: "Berlin, DE",
        status: "Shipment picked up",
      },
      {
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: "Leipzig Hub, DE",
        status: "In transit",
      },
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        location: "Destination Country",
        status: "Customs clearance",
      },
      {
        timestamp: new Date().toISOString(),
        location: "Local delivery depot",
        status: "Out for delivery",
      },
    ];

    return NextResponse.json({
      trackingNumber,
      carrier: "DHL",
      status: "Out for delivery",
      events: mockEvents,
      mock: true,
    });
  }

  // Real DHL tracking
  if (!DHL_API_KEY) {
    return NextResponse.json(
      { error: "DHL tracking not configured" },
      { status: 503 },
    );
  }

  try {
    const trackingResponse = await fetch(
      `${DHL_API_URL}/track/shipments?trackingNumber=${trackingNumber}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(DHL_API_KEY).toString("base64")}`,
        },
      },
    );

    if (!trackingResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tracking info" },
        { status: trackingResponse.status },
      );
    }

    const trackingData = await trackingResponse.json();

    return NextResponse.json({
      trackingNumber,
      carrier: "DHL",
      status: trackingData.shipments?.[0]?.status?.description || "Unknown",
      events: trackingData.shipments?.[0]?.events || [],
      mock: false,
    });
  } catch (error: any) {
    console.error("DHL tracking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking info" },
      { status: 500 },
    );
  }
}
