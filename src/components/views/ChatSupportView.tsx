import React, { useState } from 'react';
import { ChatMessage, UserProfile } from '../../types';
import { sounds } from '../../utils/audio';
import { MessageSquare, Send, Headphones, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ChatSupportViewProps {
  onBack?: () => void;
  currentUser: UserProfile;
  isMobile?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'سارا (مدیر گیمستان)', avatar: '👩‍💼', text: 'سلام به همه بازیکنان گیمستان! تورنمنت هفتگی شطرنج ساعت ۲۰ امشب شروع میشه 🏆', time: '۱۸:۳۰', badge: 'پشتیبان' },
  { id: '2', sender: 'آرش شطرنج‌باز', avatar: '🦁', text: 'من آماده‌ام! کی پایه یه دست شطرنج سریع ۵ دقیقه‌ای هست؟', time: '۱۸:۳۲' },
  { id: '3', sender: 'کوروش بزرگ', avatar: '👑', text: 'من اومدم، تو لابی شطرنج روم ۱ منتظرتم آرش جان ♟️', time: '۱۸:۳۴' },
  { id: '4', sender: 'پارسا ذهن برتر', avatar: '🧠', text: 'سودوکوی سطح حرفه‌ای امروز واقعا چالش‌برانگیز و عالی بود!', time: '۱۸:۴۰' },
];

export const ChatSupportView: React.FC<ChatSupportViewProps> = ({ onBack, currentUser, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'support'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  // Support ticket form state
  const [ticketCategory, setTicketCategory] = useState('پیشنهاد بازی جدید');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser.displayName,
      avatar: currentUser.avatar,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    sounds.playClick();
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setTicketSent(true);
    sounds.playWin();
    setTimeout(() => {
      setTicketMessage('');
      setTicketSent(false);
    }, 3500);
  };

  return (
    <div className={`w-full ${isMobile ? 'h-[calc(100vh-145px)] px-2 py-1' : 'max-w-4xl mx-auto p-3 sm:p-5'} flex flex-col gap-2 font-['Vazirmatn'] text-slate-100`}>
      {/* Header (Only show full header on Desktop) */}
      {!isMobile && (
        <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-md shadow-amber-500/20">
              💬
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-300">چت عمومی و پشتیبانی گیمستان</h1>
              <p className="text-xs text-slate-400">گفتگوی زنده با بازیکنان و ارسال تیکت به تیم فنی</p>
            </div>
          </div>

          {onBack && (
            <button
              id="chat-back-btn"
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
            >
              بازگشت
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
        <button
          id="chat-tab-live-btn"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>چت‌روم زنده بازیکنان</span>
        </button>

        <button
          id="chat-tab-support-btn"
          onClick={() => setActiveTab('support')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'support'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>پشتیبانی و ارسال تیکت</span>
        </button>
      </div>

      {activeTab === 'chat' ? (
        /* Full Height Chat Room Container */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xl min-h-0">
          {/* Messages Feed */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-2.5 no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 max-w-[90%] sm:max-w-[80%] ${
                  msg.isMe ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {msg.isMe && currentUser.customAvatarUrl ? (
                  <img
                    src={currentUser.customAvatarUrl}
                    alt={msg.sender}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400 shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="text-xl shrink-0 mt-0.5">{msg.avatar}</div>
                )}
                <div
                  className={`p-2.5 sm:p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[11px] sm:text-xs">{msg.sender}</span>
                    {msg.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-600 text-white">
                        {msg.badge}
                      </span>
                    )}
                    <span className="text-[9px] opacity-70 font-mono">{msg.time}</span>
                  </div>
                  <div className="text-xs">{msg.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Support Ticket Form */
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ارسال تیکت به کارشناسان گیمستان (پاسخ سریع)</span>
          </div>

          {ticketSent ? (
            <div className="p-6 bg-emerald-500/20 border border-emerald-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-center my-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              <h2 className="text-base font-bold text-emerald-300">تیکت شما با موفقیت ثبت شد!</h2>
              <p className="text-xs text-slate-300">
                کد پیگیری: #{Math.floor(100000 + Math.random() * 900000)} | پاسخ به زودی ارسال می‌شود.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendTicket} className="flex flex-col gap-3 flex-1 justify-between">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">موضوع پیام یا مشکل:</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="گزارش باگ یا مشکل فنی در بازی">گزارش باگ یا مشکل فنی در بازی</option>
                    <option value="پیگیری شارژ سکه و الماس کیف پول">پیگیری شارژ سکه و الماس کیف پول</option>
                    <option value="پیشنهاد بازی جدید">پیشنهاد بازی جدید</option>
                    <option value="ثبت نام در مسابقات و لیگ جایزه‌دار">ثبت نام در مسابقات و لیگ جایزه‌دار</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">متن پیام:</label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="لطفاً توضیحات خود را اینجا بنویسید..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-500 leading-relaxed"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
              >
                ارسال تیکت پشتیبانی ✉️
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
