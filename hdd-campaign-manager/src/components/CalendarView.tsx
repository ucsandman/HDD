import { useState, useMemo } from 'react';
import type { Campaign, CampaignTemplate } from '../types';
import {
  SEASON_COLORS,
  CAMPAIGN_TYPE_LABELS,
  STATUS_LABELS,
} from '../types';

interface CalendarViewProps {
  campaigns: Campaign[];
  templates: CampaignTemplate[];
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CalendarView({
  campaigns,
  templates,
  onSelectCampaign,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getTemplate = (templateId: string) =>
    templates.find((t) => t.id === templateId);

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();

    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Create array of days
    const days: (number | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return { year, month, days, totalDays };
  }, [currentDate]);

  // Get campaigns for a specific day
  const getCampaignsForDay = (day: number) => {
    const dateStr = `${calendarData.year}-${String(calendarData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return campaigns.filter((c) => c.scheduledDate === dateStr);
  };

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month/year
  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      calendarData.month === today.getMonth() &&
      calendarData.year === today.getFullYear()
    );
  };

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">{monthYear}</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-[#2F5233] hover:bg-[#2F5233]/10 rounded transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-slate-500 bg-slate-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarData.days.map((day, index) => {
          const dayCampaigns = day ? getCampaignsForDay(day) : [];

          return (
            <div
              key={index}
              className={`min-h-[100px] border-b border-r border-slate-100 p-1 ${
                day === null ? 'bg-slate-50' : ''
              }`}
            >
              {day !== null && (
                <>
                  <div
                    className={`text-sm mb-1 ${
                      isToday(day)
                        ? 'bg-[#2F5233] text-white w-7 h-7 rounded-full flex items-center justify-center font-medium'
                        : 'text-slate-600 pl-1'
                    }`}
                  >
                    {day}
                  </div>

                  <div className="space-y-1">
                    {dayCampaigns.slice(0, 3).map((campaign) => {
                      const template = getTemplate(campaign.templateId);
                      return (
                        <button
                          key={campaign.id}
                          onClick={() => onSelectCampaign(campaign)}
                          className={`w-full text-left px-1.5 py-0.5 text-xs rounded truncate ${
                            SEASON_COLORS[campaign.season]
                          } hover:opacity-80 transition-opacity`}
                          title={`${campaign.name} (${template ? CAMPAIGN_TYPE_LABELS[template.type] : ''} - ${STATUS_LABELS[campaign.status]})`}
                        >
                          {campaign.name}
                        </button>
                      );
                    })}
                    {dayCampaigns.length > 3 && (
                      <div className="text-xs text-slate-500 pl-1">
                        +{dayCampaigns.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-200"></span>
            <span className="text-slate-600">Spring</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-200"></span>
            <span className="text-slate-600">Summer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-orange-200"></span>
            <span className="text-slate-600">Fall</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-200"></span>
            <span className="text-slate-600">Winter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
