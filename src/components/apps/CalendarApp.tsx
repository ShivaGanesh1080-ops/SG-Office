import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Sparkles,
  CalendarCheck,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EventItem {
  id: string;
  title: string;
  time: string;
  day: number;
  category: 'work' | 'ai' | 'meeting' | 'review';
  participants: string[];
}

const sampleEvents: EventItem[] = [
  { id: '1', title: 'Q4 Product Roadmap Sync', time: '10:00 AM - 11:00 AM', day: 20, category: 'work', participants: ['Sarah C.', 'Alex R.'] },
  { id: '2', title: 'AI Model Optimization Briefing', time: '01:30 PM - 02:30 PM', day: 20, category: 'ai', participants: ['AI Lead', 'Data Eng'] },
  { id: '3', title: 'Design System Review', time: '03:00 PM - 04:00 PM', day: 21, category: 'review', participants: ['Design Team'] },
  { id: '4', title: 'Investor Update Call', time: '11:00 AM - 11:45 AM', day: 23, category: 'meeting', participants: ['Elena R.', 'Partners'] },
  { id: '5', title: 'SG-Office Team Retrospective', time: '04:00 PM - 05:00 PM', day: 24, category: 'work', participants: ['All Hands'] },
];

export function CalendarApp() {
  const [selectedDay, setSelectedDay] = useState<number>(20);
  const [events, setEvents] = useState<EventItem[]>(sampleEvents);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('02:00 PM - 03:00 PM');

  const daysInMonth = 31;
  const startDayOffset = 4; // Thursday start for Oct 2026

  const handleAddEvent = () => {
    if (!newTitle) return;
    const newEv: EventItem = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      day: selectedDay,
      category: 'work',
      participants: ['Me'],
    };
    setEvents([...events, newEv]);
    setNewTitle('');
    setShowNewEventModal(false);
    toast.success('Event added to Outlook Calendar');
  };

  const categoryColors = {
    work: { bg: '#e8f0fe', text: '#185abd', border: '#c7e0f4' },
    ai: { bg: '#f3e8ff', text: '#7719aa', border: '#e9d5ff' },
    meeting: { bg: '#fff4ce', text: '#895a00', border: '#ffeaa1' },
    review: { bg: '#e6f4ea', text: '#107c41', border: '#b7e1cd' },
  };

  const selectedDayEvents = events.filter((e) => e.day === selectedDay);

  return (
    <div className="flex h-full bg-white select-none text-[#201f1e]">
      {/* Calendar Grid Container */}
      <div className="flex-1 flex flex-col border-r border-[#edebe9]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#edebe9] bg-[#faf9f8]">
          <div className="flex items-center gap-3">
            <CalendarIcon size={18} className="text-[#0078d4]" />
            <h2 className="text-sm font-bold text-[#201f1e]">October 2026</h2>
            <div className="flex items-center gap-1 ml-2">
              <button className="p-1 rounded hover:bg-[#edebe9] text-[#605e5c]"><ChevronLeft size={16} /></button>
              <button className="p-1 rounded hover:bg-[#edebe9] text-[#605e5c]"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Copilot resolved calendar conflicts')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold copilot-gradient text-white"
            >
              <Sparkles size={12} /> Copilot Schedule
            </button>
            <button
              onClick={() => setShowNewEventModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-[#0078d4] hover:bg-[#005a9e] text-white rounded text-xs font-semibold"
            >
              <Plus size={14} /> New Event
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center py-2 border-b border-[#edebe9] text-[11px] font-bold text-[#605e5c] bg-[#faf9f8]">
          <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
        </div>

        {/* Calendar Cells */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-[#edebe9] p-px overflow-y-auto">
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[#faf9f8] p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = events.filter((e) => e.day === dayNum);
            const isSelected = selectedDay === dayNum;
            const isToday = dayNum === 20;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`p-2 bg-white flex flex-col justify-between cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-[#0078d4] z-10' : 'hover:bg-[#f8f9fa]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-[#0078d4] text-white' : 'text-[#201f1e]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-[#0078d4]">{dayEvents.length}</span>
                  )}
                </div>

                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium border"
                      style={{
                        background: categoryColors[ev.category].bg,
                        color: categoryColors[ev.category].text,
                        borderColor: categoryColors[ev.category].border,
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Inspector */}
      <div className="w-[300px] flex flex-col p-5 space-y-4 bg-[#faf9f8]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0078d4]">Selected Day</span>
          <h3 className="text-xl font-bold text-[#201f1e] mt-1">October {selectedDay}, 2026</h3>
          <p className="text-xs text-[#8a8886]">{selectedDayEvents.length} events scheduled</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5">
          {selectedDayEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-3 bg-white rounded-lg border border-[#edebe9] shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: categoryColors[ev.category].bg, color: categoryColors[ev.category].text }}>
                  {ev.category}
                </span>
                <span className="text-[#8a8886]">{ev.time}</span>
              </div>
              <h4 className="text-xs font-bold text-[#201f1e]">{ev.title}</h4>
              <div className="flex items-center justify-between pt-1 border-t border-[#f3f2f1] text-[11px] text-[#605e5c]">
                <span>{ev.participants.join(', ')}</span>
                <button onClick={() => toast.success('Joining Microsoft Teams meeting...')} className="text-[#0078d4] hover:underline font-semibold flex items-center gap-1">
                  <Video size={12} /> Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-[380px] bg-white rounded-lg p-5 shadow-2xl border border-[#edebe9] space-y-3">
            <h3 className="text-sm font-bold text-[#201f1e]">New Outlook Event - Oct {selectedDay}</h3>
            <input
              type="text"
              placeholder="Event Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-[#d2d0ce] rounded outline-none focus:border-[#0078d4]"
            />
            <input
              type="text"
              placeholder="Time Slot (e.g. 02:00 PM - 03:00 PM)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-[#d2d0ce] rounded outline-none focus:border-[#0078d4]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNewEventModal(false)} className="px-3 py-1 text-xs text-[#605e5c]">
                Cancel
              </button>
              <button onClick={handleAddEvent} className="px-4 py-1 text-xs font-semibold bg-[#0078d4] text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
