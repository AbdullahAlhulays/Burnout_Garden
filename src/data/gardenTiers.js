export const MAX_GARDEN_TIER = 50;

export const GARDEN_TIER_UNLOCKS = [
  { tier: 2, key: "grassPatch", label: "Small grass patches 🌿", group: "Early Growth" },
  { tier: 5, key: "moreGrass", label: "More grass fills the ground", group: "Early Growth" },
  { tier: 8, key: "firstRose", label: "First rose 🌹", group: "Early Growth" },
  { tier: 10, key: "roseDecor", label: "More roses decorate the tree", group: "Early Growth" },
  { tier: 13, key: "birdOne", label: "Small bird 🐦", group: "Life Starts" },
  { tier: 15, key: "birdMotion", label: "Bird movement", group: "Life Starts" },
  { tier: 18, key: "roseColor", label: "Second rose color variation", group: "Life Starts" },
  { tier: 20, key: "birdTwo", label: "Second bird", group: "Life Starts" },
  { tier: 22, key: "bgTreeOne", label: "Small tree in background 🌳", group: "Environment Builds" },
  { tier: 25, key: "butterflyOne", label: "Butterfly 🦋", group: "Environment Builds", highlight: true },
  { tier: 30, key: "sun", label: "Sun appears ☀️", group: "Sky and Special" },
  { tier: 32, key: "clouds", label: "Clouds ☁️", group: "Sky and Special" },
  { tier: 35, key: "grassMotion", label: "Grass movement 🍃", group: "Motion and Life" },
  { tier: 37, key: "environmentToggle", label: "Environment toggle unlocked", group: "Motion and Life", highlight: true },
  { tier: 40, key: "sunToggle", label: "Sun toggle unlocked", group: "Motion and Life" },
  { tier: 41, key: "cloudToggle", label: "Cloud toggle unlocked", group: "Motion and Life" },
  { tier: 42, key: "bgTreeTwo", label: "Second background tree 🌳🌳", group: "Polishing" },
  { tier: 45, key: "butterflyTwo", label: "Second butterfly 🦋🦋", group: "Polishing" },
  { tier: 48, key: "softGlow", label: "Soft glow and sunlight effect", group: "Final Touches" },
  { tier: 50, key: "finalScene", label: "Rare glowing bird and full living scene", group: "Final Touches", highlight: true },
];

function clampTier(value = 0) {
  return Math.max(0, Math.min(MAX_GARDEN_TIER, Math.floor(value)));
}

export function getGardenTier(points = 0) {
  return clampTier(points);
}

export function isTierUnlocked(points, tier) {
  return getGardenTier(points) >= clampTier(tier);
}

export function getUnlockedTierRewards(points = 0) {
  return GARDEN_TIER_UNLOCKS.filter((reward) => isTierUnlocked(points, reward.tier));
}

export function getNextTierUnlock(points = 0) {
  const currentTier = getGardenTier(points);
  return GARDEN_TIER_UNLOCKS.find((reward) => reward.tier > currentTier) || null;
}

export function getTierUnlockMap(points = 0) {
  return Object.fromEntries(
    GARDEN_TIER_UNLOCKS.map((reward) => [reward.key, isTierUnlocked(points, reward.tier)])
  );
}

export function getTierGroups() {
  return GARDEN_TIER_UNLOCKS.reduce((groups, reward) => {
    const existing = groups.find((group) => group.label === reward.group);

    if (existing) {
      existing.rewards.push(reward);
      return groups;
    }

    return [...groups, { label: reward.group, rewards: [reward] }];
  }, []);
}
