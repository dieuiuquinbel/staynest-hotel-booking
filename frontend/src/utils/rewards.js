const POINTS_KEY = 'dieubel_reward_points';
const REDEEMED_KEY = 'dieubel_redeemed_rewards';

export const REWARD_ITEMS = [
  {
    id: 'voucher-50k',
    title: 'Voucher giảm 50.000 đ',
    description: 'Áp dụng cho đơn đặt phòng tiếp theo.',
    cost: 100,
  },
  {
    id: 'breakfast',
    title: 'Miễn phí bữa sáng',
    description: 'Quy đổi thành gói bữa sáng cho 1 đặt phòng.',
    cost: 180,
  },
  {
    id: 'voucher-10',
    title: 'Voucher giảm 10%',
    description: 'Dùng cho phòng còn trống trong danh sách ưu đãi.',
    cost: 250,
  },
  {
    id: 'airport',
    title: 'Ưu đãi đưa đón sân bay',
    description: 'Giảm chi phí dịch vụ đưa đón sân bay.',
    cost: 320,
  },
];

function readNumber(key) {
  const value = Number(window.localStorage.getItem(key) || 0);
  return Number.isFinite(value) ? value : 0;
}

function readArray(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readRewardPoints() {
  return readNumber(POINTS_KEY);
}

export function addRewardPoints(points) {
  const next = Math.max(0, readRewardPoints() + Number(points || 0));
  window.localStorage.setItem(POINTS_KEY, String(next));
  return next;
}

export function readRedeemedRewards() {
  return readArray(REDEEMED_KEY);
}

export function redeemReward(reward) {
  const currentPoints = readRewardPoints();

  if (!reward || currentPoints < reward.cost) {
    return {
      ok: false,
      points: currentPoints,
      redeemed: readRedeemedRewards(),
    };
  }

  const nextPoints = currentPoints - reward.cost;
  const redeemedReward = {
    ...reward,
    code: `DB-${reward.id.toUpperCase()}-${String(Date.now()).slice(-5)}`,
    redeemedAt: new Date().toISOString(),
  };
  const nextRedeemed = [redeemedReward, ...readRedeemedRewards()].slice(0, 20);

  window.localStorage.setItem(POINTS_KEY, String(nextPoints));
  window.localStorage.setItem(REDEEMED_KEY, JSON.stringify(nextRedeemed));

  return {
    ok: true,
    points: nextPoints,
    redeemed: nextRedeemed,
  };
}
