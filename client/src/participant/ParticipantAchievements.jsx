import { getAchievements, downloadCertificate } from "../services/participantService";
import { useToast } from "../context/ToastContext";

const POSITION_STYLE = {
  "Winner":      { icon: "🥇", cls: "bg-amber-50 text-amber-600" },
  "Runner-Up":   { icon: "🥈", cls: "bg-gray-100 text-gray-600" },
  "Top 3 — #1": { icon: "🏅", cls: "bg-indigo-50 text-indigo-600" },
  "Top 3 — #2": { icon: "🏅", cls: "bg-indigo-50 text-indigo-600" },
  "Top 3 — #3": { icon: "🏅", cls: "bg-indigo-50 text-indigo-600" },
};

export default function ParticipantAchievements({ onBack }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    getAchievements()
      .then(d => setAchievements(d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (eventId) => {
    try {
      const blob = await downloadCertificate(eventId, "achievement");
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `Achievement_Certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showToast("Failed to download certificate.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        {onBack && (
          <button onClick={onBack} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">← Back</button>
        )}
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">🏆 My Achievements</h2>
        <span className="bg-amber-50 text-amber-600 font-bold text-xs px-3 py-1 rounded-full">{achievements.length} total</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-9 h-9 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Loading…</p>
          </div>
        </div>
      ) : achievements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-4">🏆</div>
          <p className="text-base font-bold text-gray-700">No achievements yet</p>
          <p className="text-sm text-gray-400 mt-1">Participate in events and win to see achievements here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {achievements.map((a, i) => {
            const ps = POSITION_STYLE[a.position] || { icon: "🎖️", cls: "bg-gray-100 text-gray-600" };
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">
                <div className="flex gap-4 items-start">
                  <div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center text-2xl shrink-0 ${ps.cls}`}>{ps.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-gray-900 truncate">{a.eventTitle}</h3>
                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${ps.cls}`}>{a.position}</span>
                    <p className="text-xs text-gray-400 mt-2">
                      {a.eventDate ? new Date(a.eventDate).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }) : "—"}
                      {a.participationType && ` · ${a.participationType}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDownload(a.eventId)} className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors">
                  ⬇️ Download Certificate
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
