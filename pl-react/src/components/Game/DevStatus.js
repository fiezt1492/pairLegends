import { Typography } from "@mui/material";
import { useGame } from "../contexts/GameContext";

const DevStatus = () => {
  const {
    status,
    colNum,
    champs,
    hours,
    minutes,
    seconds,
    beginAt,
    endAt,
    isRunning,
    tiles,
    champ1,
    fromChamps,
    champ2,
    tilesDone
  } = useGame();

  return (
    <>
      <Typography>
        {`Status: ${status} | Tiles: 8x${colNum} Champs: ${champs} ${` | Timer: ${hours}:${minutes}:${seconds} - ${
          isRunning ? "Running" : "Not running"
        } | BeginAt:  ${beginAt?.toLocaleString()}  | EndAt:  ${endAt?.toLocaleString()}`} | TilesDone: ${tilesDone}`}
      </Typography>
      <Typography>
        {`${
          tiles
            ? `
                             Champ1: ${
                               champ1 &&
                               `${
                                 fromChamps[`${tiles[champ1.x][champ1.y]}`]
                               } (${champ1.x}.${champ1.y})`
                             }
                             | 
                             Champ2: ${
                               champ2 &&
                               `${
                                 fromChamps[`${tiles[champ2.x][champ2.y]}`]
                               } (${champ2.x}.${champ2.y})`
                             }
                            `
            : "Tiles empty"
        }`}
      </Typography>
    </>
  );
};

export default DevStatus;
