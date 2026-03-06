import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import StatusWidget from '../components/StatusWidget';
import ActivityWidget from '../components/ActivityWidget';
import QuietModeWidget from '../components/QuietModeWidget';
import KarmaWidget from '../components/KarmaWidget';

const Home = () => {
  const { user, household, activity, fetchData } = useOutletContext();
  const [karmaData, setKarmaData] = useState([]);

  const handleStatusChange = () => fetchData();

  const fetchKarma = useCallback(async () => {
    if (!household?.id) return;
    try {
      const res = await api.get(`/karma/${household.id}`);
      setKarmaData(res.data);
    } catch (e) { console.error(e); }
  }, [household?.id]);

  useEffect(() => {
    fetchKarma();
    // ✅ FIX: Refresh BOTH Karma AND Activity Feed every 3 seconds
    const interval = setInterval(() => {
        fetchKarma();
        fetchData(); // This refreshes the Activity Feed!
    }, 3000); 
    return () => clearInterval(interval);
  }, [fetchKarma, fetchData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
      {/* LEFT: Controls */}
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
          <StatusWidget user={user} onStatusChange={handleStatusChange} />
        </div>
        <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
          <QuietModeWidget user={user} household={household} onQuietChange={handleStatusChange} />
        </div>
      </div>

      {/* MIDDLE: Karma Board */}
      <div className="flex flex-col gap-6">
        <div className="h-full rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
          <KarmaWidget data={karmaData} /> 
        </div>
      </div>

      {/* RIGHT: Activity Feed */}
      <div className="h-full rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm min-h-[400px]">
         <ActivityWidget activity={activity} />
      </div>
    </div>
  );
};

export default Home;