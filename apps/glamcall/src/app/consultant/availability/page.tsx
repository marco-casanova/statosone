"use client";

import { useState } from "react";
import { Check, X, Clock, Save, AlertCircle } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

// Mock initial availability
const initialAvailability: { [key: string]: string[] } = {
  Monday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  Tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  Wednesday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  Thursday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  Friday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  Saturday: [],
  Sunday: [],
};

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState(initialAvailability);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(time)
        ? daySlots.filter((t) => t !== time)
        : [...daySlots, time].sort();
      return { ...prev, [day]: newSlots };
    });
    setHasChanges(true);
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      const newSlots =
        daySlots.length > 0
          ? []
          : TIME_SLOTS.filter((t) => t >= "09:00" && t <= "17:00");
      return { ...prev, [day]: newSlots };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    setHasChanges(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Availability Schedule
          </h1>
          <p className="text-gray-500">
            Set when you're available for customer consultations
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`btn-primary flex items-center gap-2 ${
            !hasChanges || saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">How it works</p>
          <p>
            Click on time slots to toggle your availability. Green slots mean
            you're available for calls during that hour. Customers will only see
            you as available during these times.
          </p>
        </div>
      </div>

      {/* Availability Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-4 text-left text-sm font-medium text-gray-500 w-20">
                  <Clock className="w-4 h-4" />
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="p-4 text-center text-sm font-medium text-gray-900"
                  >
                    <button
                      onClick={() => toggleDay(day)}
                      className="hover:text-glam-600 transition-colors"
                    >
                      {day.slice(0, 3)}
                    </button>
                    <div className="text-xs font-normal text-gray-400 mt-1">
                      {(availability[day] || []).length} slots
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-500">
                    {time}
                  </td>
                  {DAYS.map((day) => {
                    const isAvailable = (availability[day] || []).includes(
                      time,
                    );
                    return (
                      <td key={`${day}-${time}`} className="p-2">
                        <button
                          onClick={() => toggleSlot(day, time)}
                          className={`w-full h-12 rounded-lg transition-all flex items-center justify-center ${
                            isAvailable
                              ? "bg-green-100 hover:bg-green-200 text-green-600"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-300"
                          }`}
                        >
                          {isAvailable ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-300" />
          </div>
          <span className="text-gray-600">Unavailable</span>
        </div>
      </div>
    </div>
  );
}
