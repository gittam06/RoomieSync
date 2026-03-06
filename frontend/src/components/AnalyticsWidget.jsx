import { TrendingUp } from 'lucide-react';

const AnalyticsWidget = ({ user, data }) => {
  const total = data?.total || 0;
  
  // Find my personal data in the list
  const myData = data?.per_person?.find(p => p.user_id === user?.id);
  const myPaid = myData?.total_paid || 0;
  
  // Calculate fair share (Total / number of people involved)
  const memberCount = data?.per_person?.length || 1;
  const fairShare = total / memberCount;

  return (
    <div className="p-6 h-full flex flex-col">
       <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-blue-400" /> Expense Analytics
       </h3>

       <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
             <div className="w-48 h-48 rounded-full border-[12px] border-slate-800 flex items-center justify-center relative mx-auto mb-6 shadow-2xl shadow-black/50">
                 <div className="text-center">
                    <p className="text-4xl font-black text-white">₹{total}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Total Spent</p>
                 </div>
             </div>
             <p className="text-slate-400 text-sm">
                Split between {memberCount} members
             </p>
          </div>
       </div>
       
       <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-center">
             <p className="text-xs text-slate-500 uppercase font-bold mb-1">You Paid</p>
             <p className={`text-xl font-bold ${myPaid >= fairShare ? 'text-emerald-400' : 'text-orange-400'}`}>
                ₹{myPaid}
             </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-center">
             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Your Share</p>
             <p className="text-xl font-bold text-white">₹{fairShare.toFixed(0)}</p>
          </div>
       </div>
    </div>
  );
};

export default AnalyticsWidget;