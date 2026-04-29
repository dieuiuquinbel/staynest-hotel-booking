export function getAvailabilityMeta(inventoryCount) {
  const count = Number(inventoryCount) || 0;

  if (count <= 0) {
    return {
      label: 'Hết phòng',
      badgeClass: 'bg-slate-900/80 text-white',
      textClass: 'text-rose-600',
      description: () => 'Tạm thời không còn phòng trống.',
    };
  }

  if (count <= 3) {
    return {
      label: 'Sắp hết',
      badgeClass: 'bg-amber-100 text-amber-700',
      textClass: 'text-amber-600',
      description: () => `Chỉ còn ${count} phòng, nên đặt sớm.`,
    };
  }

  return {
    label: 'Còn phòng',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    textClass: 'text-emerald-600',
    description: () => `Còn ${count} phòng, có thể đặt ngay.`,
  };
}
