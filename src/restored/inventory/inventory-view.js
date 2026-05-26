function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderInventoryAction(item) {
  if (item.type !== "consumable") {
    return `<div class="text-xs font-black text-indigo-600 bg-white px-2 py-1 rounded-full">x${item.count}</div>`;
  }
  return `<div class="flex items-center gap-1"><span class="text-xs font-black text-indigo-600 bg-white px-2 py-1 rounded-full">x${item.count}</span><button onclick="useInventoryItem('${escapeHtml(item.id)}')" class="text-[10px] font-black text-white bg-emerald-600 px-2 py-1 rounded-full active:scale-95">사용</button></div>`;
}

export function renderRestoredInventoryPreviewHtml(items) {
  if (!items.length) {
    return '<div class="col-span-full rounded-xl bg-slate-50 border border-slate-100 px-4 py-5 text-center text-xs font-bold text-slate-400">소지품 없음</div>';
  }
  return items.map((item) => `<div class="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-2xl shadow-sm">${escapeHtml(item.img)}</div><div class="flex-1 min-w-0"><div class="font-bold text-sm text-slate-800 truncate">${escapeHtml(item.name)}</div><div class="text-[10px] font-bold text-slate-400 uppercase">${escapeHtml(item.type)}</div></div>${renderInventoryAction(item)}</div>`).join("");
}
