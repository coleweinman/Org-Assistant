import React from "react";

type SeasonSelectProps = {
  seasonId: string,
  setSeasonId: (id: string) => void,
  allSeasonIds: string[],
};

const SeasonSelect: React.FunctionComponent<SeasonSelectProps> = ({ seasonId, setSeasonId, allSeasonIds }) => (
  <select className="season-select" value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
    {allSeasonIds.map((id) => (
      <option value={id} key={id}>{id}</option>
    ))}
  </select>
);

export default SeasonSelect;