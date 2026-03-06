import { Send, Megaphone, MessageCircle, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../api';

const ChatWidget = ({ messages, user, household, onRefresh }) => {
   const [msg, setMsg] = useState('');
   const [isAnnouncement, setIsAnnouncement] = useState(false);
   const scrollRef = useRef(null);

   // Auto-scroll to bottom
   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [messages]);

   const handleSend = async (e) => {
      e.preventDefault();
      if (!msg.trim()) return;

      try {
         await api.post(`/chat/${user.id}/${household.id}`, {
            message: msg,
            is_announcement: isAnnouncement
         });
         setMsg('');
         setIsAnnouncement(false);
         onRefresh();
      } catch (e) { console.error(e); }
   };

   // Get avatar colors for users
   const getAvatarColor = (senderId) => {
      const colors = [
         'from-blue-500 to-cyan-500',
         'from-purple-500 to-pink-500',
         'from-emerald-500 to-teal-500',
         'from-orange-500 to-amber-500',
         'from-rose-500 to-red-500',
         'from-indigo-500 to-violet-500',
      ];
      return colors[senderId % colors.length];
   };

   const formatTime = (dateStr) => {
      if (!dateStr) return '';
      try {
         const d = new Date(dateStr);
         return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch { return ''; }
   };

   return (
      <div className="h-full flex flex-col rounded-3xl overflow-hidden border border-white/5 shadow-xl relative">
         {/* Gradient background accent */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>

         {/* Header */}
         <div className="relative p-4 border-b border-white/5 bg-slate-900/90 backdrop-blur-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <MessageCircle size={16} className="text-white" />
               </div>
               <div>
                  <h3 className="font-bold text-white text-sm">House Chat</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{messages.length} messages</p>
               </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
               <span className="text-[10px] text-emerald-400 font-bold">Live</span>
            </div>
         </div>

         {/* Messages Area */}
         <div className="relative flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/30" ref={scrollRef}>
            {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mb-4">
                     <Sparkles size={28} className="text-blue-400/60" />
                  </div>
                  <p className="text-slate-400 font-semibold text-sm">No messages yet</p>
                  <p className="text-xs text-slate-600 mt-1">Start the conversation! Say hello 👋</p>
               </div>
            ) : (
               messages.map((m) => {
                  const isMe = m.sender_id === user.id;
                  return (
                     <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar for others */}
                        {!isMe && !m.is_announcement && (
                           <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(m.sender_id)} flex items-center justify-center text-xs flex-shrink-0 shadow-md`}>
                              {m.sender?.avatar || m.sender?.username?.charAt(0)?.toUpperCase() || '?'}
                           </div>
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${m.is_announcement
                              ? 'bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/30 text-white shadow-lg shadow-orange-900/10 rounded-xl'
                              : (isMe
                                 ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20 rounded-br-md'
                                 : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-bl-md')
                           }`}>
                           {!isMe && !m.is_announcement && (
                              <p className="text-[10px] text-blue-400 font-bold mb-0.5 tracking-wide">{m.sender?.username}</p>
                           )}
                           {m.is_announcement && (
                              <p className="text-[10px] text-orange-400 font-bold mb-1 flex items-center gap-1 uppercase tracking-wider">
                                 <Megaphone size={10} /> Announcement by {m.sender?.username}
                              </p>
                           )}
                           <p className="text-[13px] leading-relaxed">{m.message}</p>
                           <p className={`text-[9px] mt-1 ${isMe ? 'text-blue-300/50 text-right' : 'text-slate-500'}`}>
                              {formatTime(m.created_at)}
                           </p>
                        </div>
                     </div>
                  );
               })
            )}
         </div>

         {/* Input Area */}
         <form onSubmit={handleSend} className="relative p-3 bg-slate-900/90 backdrop-blur-xl border-t border-white/5">
            {isAnnouncement && (
               <div className="text-[11px] text-orange-400 font-bold flex items-center gap-1 mb-2 px-1 animate-pulse">
                  <Megaphone size={11} /> Sending as Announcement
               </div>
            )}
            <div className="flex gap-2 items-center">
               <button
                  type="button"
                  onClick={() => setIsAnnouncement(!isAnnouncement)}
                  className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${isAnnouncement ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 scale-105' : 'bg-slate-800/80 text-slate-500 hover:text-white hover:bg-slate-700 border border-white/5'}`}
                  title="Make Announcement"
               >
                  <Megaphone size={18} />
               </button>
               <input
                  type="text"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 placeholder:text-slate-600 transition-all"
               />
               <button type="submit" className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white p-2.5 rounded-xl transition-all flex-shrink-0 shadow-md shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-900/30 active:scale-95">
                  <Send size={18} />
               </button>
            </div>
         </form>
      </div>
   );
};

export default ChatWidget;