import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "created", label: "Order Created" },
  { status: "paid", label: "Payment Confirmed" },
  { status: "in_production", label: "In Production" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicTrackingPage({ params }: PageProps) {
  const { token } = await params;
  if (!token) notFound();

  let order: any = null;
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        color,
        material,
        quality,
        quantity,
        created_at,
        updated_at,
        tracking_number,
        label_url,
        model:models(filename, file_type)
      `,
      )
      .eq("tracking_token", token)
      .single();

    if (error || !data) notFound();
    order = data;
  } catch {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tracking Unavailable
          </h1>
          <p className="text-gray-600 mb-6">
            We could not load tracking information right now.
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = STEPS.findIndex((step) => step.status === order.status);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Project Status #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-500 mt-1">
            Updated {new Date(order.updated_at).toLocaleString()}
          </p>
          <div className="mt-4">
            {isCancelled ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 font-medium">
                <XCircle className="w-4 h-4" />
                Cancelled
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                {order.status.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {!isCancelled && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Progress</h2>
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
              <div className="relative flex justify-between">
                {STEPS.map((step, idx) => {
                  const completed = idx <= currentStepIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          completed ? "bg-forge-500 text-white" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {idx === 0 && <Clock className="w-4 h-4" />}
                        {idx === 1 && <CreditCard className="w-4 h-4" />}
                        {idx === 2 && <Package className="w-4 h-4" />}
                        {idx === 3 && <Truck className="w-4 h-4" />}
                        {idx === 4 && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          completed ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Project Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">File</p>
              <p className="font-medium text-gray-900 truncate" title={order.model?.filename}>
                {order.model?.filename}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium text-gray-900 uppercase">{order.model?.file_type}</p>
            </div>
            <div>
              <p className="text-gray-500">Material</p>
              <p className="font-medium text-gray-900">{order.material}</p>
            </div>
            <div>
              <p className="text-gray-500">Color</p>
              <p className="font-medium text-gray-900">{order.color}</p>
            </div>
            <div>
              <p className="text-gray-500">Quality</p>
              <p className="font-medium text-gray-900 capitalize">{order.quality}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium text-gray-900">{order.quantity}</p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium text-gray-900">{order.status.replace("_", " ")}</p>
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Carrier Tracking</p>
              <p className="font-mono font-semibold text-gray-900">{order.tracking_number}</p>
              {order.label_url && (
                <a
                  href={order.label_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-forge-600 hover:text-forge-700 mt-2"
                >
                  Open Carrier Tracking
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
