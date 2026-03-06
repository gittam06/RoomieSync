import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ChatWidget from '../components/ChatWidget';
import ComplaintWidget from '../components/ComplaintWidget';
import PollWidget from '../components/PollWidget';
import AddComplaintModal from '../components/AddComplaintModal';
import CreatePollModal from '../components/CreatePollModal';

const Social = () => {
  const { user, household } = useOutletContext();

  const [messages, setMessages] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [polls, setPolls] = useState([]);

  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [pollModalOpen, setPollModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!household?.id) return;
    try {
      const [chatRes, compRes, pollRes] = await Promise.all([
        api.get(`/chat/${household.id}`),
        api.get(`/complaints/${household.id}`),
        api.get(`/polls/${household.id}`)
      ]);

      const sortedMessages = chatRes.data.sort((a, b) => a.id - b.id);
      setMessages(sortedMessages);

      setComplaints(compRes.data);
      setPolls(pollRes.data);
    } catch (e) { console.error(e); }
  }, [household?.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">

      {/* LEFT: Chat — fixed height like Tasks page */}
      <div className="lg:col-span-2 h-[520px]">
        <ChatWidget
          messages={messages}
          user={user}
          household={household}
          onRefresh={fetchData}
        />
      </div>

      {/* RIGHT: Polls & Complaints */}
      <div className="flex flex-col gap-6">
        <div className="h-[250px] rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
          <PollWidget
            polls={polls}
            user={user}
            household={household}
            onAddClick={() => setPollModalOpen(true)}
            onRefresh={fetchData}
          />
        </div>

        <div className="h-[250px] rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
          <ComplaintWidget
            complaints={complaints}
            user={user}
            household={household}
            onAddClick={() => setComplaintModalOpen(true)}
            onRefresh={fetchData}
          />
        </div>
      </div>

      <AddComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        household={household}
        user={user}
        onAdd={fetchData}
      />
      <CreatePollModal
        isOpen={pollModalOpen}
        onClose={() => setPollModalOpen(false)}
        household={household}
        user={user}
        onAdd={fetchData}
      />

    </div>
  );
};

export default Social;