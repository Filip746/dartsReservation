import { TRANSLATIONS } from "@/src/shared/constants/app";
import { Appointment, Machine } from "@/src/shared/types/domain";
import { Modal } from "@/src/shared/ui/Modal";
import { formatDate } from "@/src/shared/utils/date";

export const HistoryModal = ({
  isOpen,
  onClose,
  user,
  appointments,
  machines,
  onCancel,
  lang,
}: any) => {
  if (!isOpen || !user) return null;
  const t = TRANSLATIONS[lang];
  const userApps = appointments
    .filter((a: Appointment) => a.userId === user.id)
    .sort(
      (a: Appointment, b: Appointment) =>
        new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );

  const now = new Date();

  const getStatus = (app: Appointment) => {
    const [y, m, day] = app.weekStart.split("-").map(Number);
    const d = new Date(y, m - 1, day);
    const offset = app.dayIndex === 0 ? 6 : app.dayIndex - 1;
    d.setDate(d.getDate() + offset);
    d.setHours(app.hour, 0, 0, 0);

    if (d < now)
      return {
        label: t.completed || "Completed",
        color: "text-slate-500",
        bg: "bg-slate-800",
      };
    return {
      label: t.upcoming || "Upcoming",
      color: "text-emerald-400",
      bg: "bg-emerald-900/20",
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.myBookings}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {userApps.length === 0 ? (
          <p className="text-slate-500 text-center italic">{t.noBookings}</p>
        ) : (
          userApps.map((app: Appointment) => {
            const status = getStatus(app);
            const [y, m, day] = app.weekStart.split("-").map(Number);
            const d = new Date(y, m - 1, day);
            const offset = app.dayIndex === 0 ? 6 : app.dayIndex - 1;
            d.setDate(d.getDate() + offset);
            d.setHours(app.hour, 0, 0, 0);
            const machineName =
              machines.find((m: Machine) => m.id === app.machineId)?.name ||
              "Unknown";
            const canCancel =
              new Date(d).getTime() - now.getTime() > 2 * 60 * 60 * 1000;

            return (
              <div
                key={app.id}
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {formatDate(d, lang)} @ {app.hour}:00
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    {machineName}
                  </div>
                  <div className="text-xs text-slate-400">
                    Price: €{app.price}
                  </div>
                </div>
                {status.label !== (t.completed || "Completed") && (
                  <button
                    onClick={() => onCancel(app.id)}
                    disabled={!canCancel}
                    className={`p-2 rounded-lg transition-colors ${
                      canCancel
                        ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                        : "text-slate-600 cursor-not-allowed"
                    }`}
                    title={canCancel ? t.cancel : t.cancelTooLate}
                  >
                    <i className="ph-bold ph-x"></i>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
