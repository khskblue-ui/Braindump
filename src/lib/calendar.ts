import type { Entry } from '@/types';

export function generateICS(entry: Entry): string {
  const now = new Date();
  const start = entry.due_date ? new Date(entry.due_date) : now;
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default duration

  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const title = entry.summary || entry.raw_text?.slice(0, 50) || 'BrainDump 항목';
  const description = entry.raw_text || '';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BrainDump//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n').slice(0, 500)}`,
    `UID:${entry.id}@braindump`,
    `DTSTAMP:${formatDate(now)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICS(entry: Entry) {
  const ics = generateICS(entry);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${entry.summary || 'braindump'}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(entry: Entry): string {
  const start = entry.due_date ? new Date(entry.due_date) : new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const formatGoogleDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const title = entry.summary || entry.raw_text?.slice(0, 50) || 'BrainDump 항목';
  const details = entry.raw_text || '';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: details.slice(0, 500),
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}
