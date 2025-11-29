import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Card from "../components/Card";
import Button from "../components/Button";
import { Plus, Trash2, DollarSign } from "lucide-react";

export default function CreatePost() {
  const { user, addFundRequest, addGrantOffer } = useApp();

  const [form, setForm] = useState({ name: "", description: "" });

  // State Table Items
  const [items, setItems] = useState([
    { name: "", quantity: "", type: "", price: "" },
  ]);
  const [totalCalculated, setTotalCalculated] = useState(0);

  // --- LOGIC TABLE ---

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: "", type: "", price: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // --- PERBAIKAN LOGIKA HITUNG (Price * Quantity) ---
  useEffect(() => {
    const sum = items.reduce((acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;

      // Rumus: Akumulasi + (Jumlah * Harga Satuan)
      return acc + qty * price;
    }, 0);
    setTotalCalculated(sum);
  }, [items]);

  // --- SUBMIT HANDLER ---
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("gdgsdgsg");

    if (user.role === "scientist") {
      // Format text biar rapi di profile:
      // Contoh: "- Laptop (Qty: 2) [Tech] : $1000/unit (Sub: $2000)"
      console.log("scientist");
      const formattedItems = items.map((i) => {
        const qty = parseFloat(i.quantity) || 0;
        const price = parseFloat(i.price) || 0;

        return {
          name: i.name || "Item",
          quantity: qty,
          type: i.type || "-",
          pricePerUnit: price,
        };
      });

      const formData = form;
      console.log(formData);
      console.log(formattedItems);

      addFundRequest({
        ...form,
        items: formattedItems,
        totalFund: totalCalculated,
      });
    } else {
      addGrantOffer({
        name: form.name,
        description: form.description,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="p-8 border-t-4 border-t-blue-500">
        <h2 className="text-3xl font-serif font-bold mb-8 text-white">
          {user.role === "scientist"
            ? "Create Fund Request"
            : "Create Grant Offer"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 ml-1">
              Project Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sustainable Water Purification System"
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-lg transition-colors"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 ml-1">
              Description
            </label>
            <textarea
              placeholder="Describe your project goals, methodology, and impact..."
              rows="4"
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-slate-300 transition-colors"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          {user.role === "scientist" && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-slate-400 ml-1">
                  List of Needs (Budget Plan)
                </label>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="p-4 font-bold">Item Name</th>
                      <th className="p-4 font-bold w-20">Qty</th>
                      <th className="p-4 font-bold w-1/4">Type</th>
                      <th className="p-4 font-bold w-32 text-right">
                        Unit Price
                      </th>
                      <th className="p-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="group hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Item Name"
                            required
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(index, "name", e.target.value)
                            }
                            className="w-full bg-transparent p-2 outline-none text-white placeholder-slate-600"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            placeholder="1"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full bg-transparent p-2 outline-none text-white placeholder-slate-600 text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Transportation, Utility..."
                            required
                            value={item.type}
                            onChange={(e) =>
                              handleItemChange(index, "type", e.target.value)
                            }
                            className="w-full bg-transparent p-2 outline-none text-white placeholder-slate-600"
                          />
                        </td>
                        <td className="p-2 relative">
                          <span className="absolute left-4 top-4 text-slate-600 text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            placeholder="0"
                            required
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(index, "price", e.target.value)
                            }
                            className="w-full bg-transparent p-2 outline-none text-white placeholder-slate-600 text-right font-mono pr-2"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-slate-600 hover:text-red-500 transition p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-3 bg-slate-900/50 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wide px-2 py-1"
                  >
                    <Plus size={16} /> Add New Item
                  </button>
                </div>
              </div>

              {/* TOTAL FUNDING (Automatic Calc) */}
              <div className="flex justify-end items-center gap-4 mt-4 p-4 bg-blue-900/10 border border-blue-500/30 rounded-xl">
                <div className="text-right">
                  <div className="text-slate-400 font-bold uppercase text-xs">
                    Total Calculated Funding
                  </div>
                  <div className="text-xs text-slate-500">
                    (Sum of Qty * Unit Price)
                  </div>
                </div>
                <div className="text-3xl font-mono font-bold text-blue-400 flex items-center">
                  <DollarSign size={24} strokeWidth={3} />
                  {totalCalculated.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              variant={user.role === "scientist" ? "primary" : "secondary"}
              className="px-8 py-3 text-lg"
            >
              Publish {user.role === "scientist" ? "Request" : "Offer"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
