import Link from "next/link";

export function SubscriptionBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-semibold">
                Unlock unlimited access to all stories!
              </p>
              <p className="text-purple-200 text-sm">
                Start your 7-day free trial today
              </p>
            </div>
          </div>

          <Link
            href="/pricing"
            className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-colors whitespace-nowrap"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
