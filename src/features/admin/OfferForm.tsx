import { DRINK_MENU } from "@/src/shared/constants/app";

export const OfferForm = ({ offerState, setOfferState, t }: any) => {
  return (
    <div className="space-y-4 mb-4">
      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">
          {t.createOffer} Name
        </label>
        <input
          type="text"
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
          value={offerState.name}
          onChange={(e) =>
            setOfferState({ ...offerState, name: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">
            {t.offerType}
          </label>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            value={offerState.type}
            onChange={(e) =>
              setOfferState({ ...offerState, type: e.target.value })
            }
          >
            <option value="discount_percent">{t.types.discount_percent}</option>
            <option value="fixed_price">{t.types.fixed_price}</option>
            <option value="free_drink">{t.types.free_drink}</option>
            <option value="free_slot">{t.types.free_slot}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">
            {t.offerValue}
          </label>
          {offerState.type === "free_drink" ? (
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
              value={offerState.rewardProduct}
              onChange={(e) =>
                setOfferState({ ...offerState, rewardProduct: e.target.value })
              }
            >
              {DRINK_MENU.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
              value={offerState.value}
              onChange={(e) =>
                setOfferState({
                  ...offerState,
                  value: parseInt(e.target.value),
                })
              }
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">
            Start Date
          </label>
          <input
            type="date"
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            value={
              offerState.startDate ? offerState.startDate.split("T")[0] : ""
            }
            onChange={(e) =>
              setOfferState({
                ...offerState,
                startDate: new Date(e.target.value).toISOString(),
              })
            }
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">
            End Date
          </label>
          <input
            type="date"
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            value={offerState.endDate ? offerState.endDate.split("T")[0] : ""}
            onChange={(e) =>
              setOfferState({
                ...offerState,
                endDate: new Date(e.target.value).toISOString(),
              })
            }
          />
        </div>
      </div>
      <div className="border-t border-slate-800 pt-4">
        <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
          {t.condition}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              name="condition"
              checked={offerState.conditionType === "none"}
              onChange={() =>
                setOfferState({ ...offerState, conditionType: "none" })
              }
              className="accent-amber-500"
            />
            None
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              name="condition"
              checked={offerState.conditionType === "buy_x_slots"}
              onChange={() =>
                setOfferState({ ...offerState, conditionType: "buy_x_slots" })
              }
              className="accent-amber-500"
            />
            {t.buyXGetY}
          </label>
        </div>
        {offerState.conditionType === "buy_x_slots" && (
          <div className="mt-2">
            <label className="text-xs text-slate-500 uppercase font-bold">
              {t.minSlots}
            </label>
            <input
              type="number"
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white mt-1"
              value={offerState.conditionValue}
              onChange={(e) =>
                setOfferState({
                  ...offerState,
                  conditionValue: parseInt(e.target.value),
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
