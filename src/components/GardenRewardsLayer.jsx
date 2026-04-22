import {
  GARDEN_TIER_UNLOCKS,
  getGardenTier,
  getNextTierUnlock,
  getTierGroups,
  getTierUnlockMap,
} from "../data/gardenTiers";

function GardenRewardsLayer({ totalPoints, settings, onUpdateSettings }) {
  const unlocks = getTierUnlockMap(totalPoints);
  const tier = getGardenTier(totalPoints);
  const nextUnlock = getNextTierUnlock(totalPoints);
  const environmentVariant = settings?.environmentVariant ?? "meadow";
  const showSun = settings?.showSun ?? true;
  const showClouds = settings?.showClouds ?? true;

  return (
    <div className={`garden-rewards-layer variant-${environmentVariant}`}>
      <div className="garden-ambient-haze" />
      {unlocks.softGlow ? <div className="garden-sun-glow" /> : null}

      {unlocks.bgTreeOne ? <span className="garden-bg-tree tree-one" aria-hidden="true" /> : null}
      {unlocks.bgTreeTwo ? <span className="garden-bg-tree tree-two" aria-hidden="true" /> : null}

      {unlocks.sun && showSun ? <span className="garden-sun" aria-hidden="true" /> : null}

      {unlocks.clouds && showClouds ? (
        <>
          <span className="garden-cloud cloud-one" aria-hidden="true" />
          <span className="garden-cloud cloud-two" aria-hidden="true" />
        </>
      ) : null}

      {unlocks.grassPatch ? (
        <div className={`garden-grass-bed ${unlocks.grassMotion ? "moving" : ""}`} aria-hidden="true">
          <span className="garden-grass-tuft tuft-left" />
          <span className="garden-grass-tuft tuft-right" />
          <span className="garden-grass-tuft tuft-center-left" />
          <span className="garden-grass-tuft tuft-center-right" />
          {unlocks.moreGrass ? (
            <>
              <span className="garden-grass-tuft tuft-far-left" />
              <span className="garden-grass-tuft tuft-far-right" />
              <span className="garden-grass-tuft tuft-inner-left" />
              <span className="garden-grass-tuft tuft-inner-right" />
            </>
          ) : null}
        </div>
      ) : null}

      {unlocks.firstRose ? <span className="garden-rose rose-one" aria-hidden="true" /> : null}
      {unlocks.roseDecor ? <span className="garden-rose rose-two" aria-hidden="true" /> : null}
      {unlocks.roseColor ? <span className="garden-rose rose-three rose-alt" aria-hidden="true" /> : null}

      {unlocks.birdOne ? (
        <span className={`garden-bird bird-one ${unlocks.birdMotion ? "flying" : ""}`} aria-hidden="true">
          🐦
        </span>
      ) : null}
      {unlocks.birdTwo ? (
        <span className={`garden-bird bird-two ${unlocks.birdMotion ? "flying" : ""}`} aria-hidden="true">
          🐦
        </span>
      ) : null}

      {unlocks.butterflyOne ? <span className="garden-butterfly butterfly-one" aria-hidden="true">🦋</span> : null}
      {unlocks.butterflyTwo ? <span className="garden-butterfly butterfly-two" aria-hidden="true">🦋</span> : null}

      {unlocks.finalScene ? (
        <span className="garden-rare-bird" aria-hidden="true">
          ✨🐦
        </span>
      ) : null}

      {unlocks.environmentToggle ? (
        <div className="garden-controls">
          <div className="garden-control-card">
            <p className="garden-control-label">Garden Tier {tier}</p>
            <p className="garden-control-sub">
              {nextUnlock
                ? `Next unlock at Tier ${nextUnlock.tier}: ${nextUnlock.label}`
                : "Every listed garden reward is unlocked."}
            </p>

            <div className="garden-toggle-group">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings?.({
                    environmentVariant:
                      environmentVariant === "meadow" ? "sunset" : "meadow",
                  })
                }
                className="garden-toggle-button"
              >
                {environmentVariant === "meadow" ? "Switch to Sunset" : "Switch to Meadow"}
              </button>

              {unlocks.sunToggle ? (
                <button
                  type="button"
                  onClick={() => onUpdateSettings?.({ showSun: !showSun })}
                  className="garden-toggle-button subtle"
                >
                  {showSun ? "Hide Sun" : "Show Sun"}
                </button>
              ) : null}

              {unlocks.cloudToggle ? (
                <button
                  type="button"
                  onClick={() => onUpdateSettings?.({ showClouds: !showClouds })}
                  className="garden-toggle-button subtle"
                >
                  {showClouds ? "Hide Clouds" : "Show Clouds"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GardenTierPreview() {
  const groups = getTierGroups();

  return (
    <div className="wordle-tier-preview-shell">
      <p className="wordle-tier-preview-hint">
        Points raise your tier. Each tier unlocks new life and polish in the garden.
      </p>

      <div className="wordle-tier-preview-scroll">
        {groups.map((group) => (
          <div key={group.label} className="wordle-tier-group">
            <p className="wordle-tier-group-title">{group.label}</p>

            {group.rewards.map((reward) => (
              <div
                key={reward.key}
                className={`wordle-tier-preview-item ${reward.highlight ? "highlight" : ""}`}
              >
                <span>Tier {reward.tier}</span>
                <strong>{reward.label}</strong>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GardenRewardsLayer;
