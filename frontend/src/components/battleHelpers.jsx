const ERAS = [
  { year: 1990, label: "Golden Age" },
  { year: 1995, label: "East Coast Peak" },
  { year: 2000, label: "Bling Era" },
  { year: 2005, label: "Ringtone Era" },
  { year: 2010, label: "Blog Era" },
  { year: 2015, label: "Streaming Era" },
  { year: 2020, label: "TikTok Era" },
  { year: 2025, label: "AI Era" },
];

export const getEraLabel = (year) => {
  const era = ERAS.reduce((prev, curr) => 
    Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
  );
  return era.label;
};

export const TierBadge = ({ tier }) => {
  const tierClass = `tier-${tier.toLowerCase()}`;
  return (
    <span className={`tier-badge ${tierClass}`} data-testid="tier-badge">
      {tier}
    </span>
  );
};
