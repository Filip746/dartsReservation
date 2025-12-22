import { Button } from "@/src/shared/ui/Button";

export const DiscountTierForm = ({ initialData, onSave, onCancel, t }: any) => {
  const [data, setData] = useState(
    initialData || { threshold: 3, discount: 10 }
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">
            {t.threshold}
          </label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
            value={data.threshold}
            onChange={(e) =>
              setData({ ...data, threshold: parseInt(e.target.value) })
            }
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">
            {t.types.discount_percent}
          </label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
            value={data.discount}
            onChange={(e) =>
              setData({ ...data, discount: parseInt(e.target.value) })
            }
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-xs py-1 px-2 h-auto"
        >
          {t.cancel}
        </Button>
        <Button
          onClick={() => onSave(data)}
          className="text-xs py-1 px-2 h-auto"
        >
          {t.save}
        </Button>
      </div>
    </div>
  );
};

function useState(arg0: any): [any, any] {
  throw new Error("Function not implemented.");
}
