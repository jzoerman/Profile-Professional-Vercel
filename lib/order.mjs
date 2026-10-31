// Missing activation flags retain the source application's legacy default of true.
export const active = item => !!item && item.isActive !== false;
export const ordered = (items = []) => items.filter(active).sort((a,b)=>(a.sortKey ?? 0)-(b.sortKey ?? 0));
