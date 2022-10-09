import * as React from "react";
import {Box, Button} from "@mui/material";
import {getExpiredTime, useGame} from "../contexts/GameContext";
import GameTimer from "./GameTimer";
import Tiles from "./Tiles";
import {getListPosItem} from "../../utils/Binder";
import {getBoard, reloadBoard} from "../../utils/Generator";
import {mixChampions} from "../../utils";

export default function Gameplay() {
    const {
        status,
        tiles,
        timer,
        handleOnIdle,
        champ1,
        champ2,
        // reloadHandler,
        colNum,
        duration,
        champs,
        setTiles,
        setChamp1,
        setChamp2,
        setTilesDone,
        // isWillReload,
        // isJustReloaded,
        isNew,
        // setIsWillReload,
        // setIsJustReloaded,
        setIsNew,
        restart,
        setStatus,
        setFromChamps,
    } = useGame();

    const [isWillReload, setIsWillReload] = React.useState(false);
    const [isJustReloaded, setIsJustReloaded] = React.useState(false);

    let count = 0;
    let lines = [];
    let lastLines = [];
    let newTiles = [];
    let hasLine = false;
    let doneLine = false;
    let satisfiableItems = new Array(champs + 1);
    let listPosItem = getListPosItem(tiles, 8, colNum, champs);

    /**
     * @description test if two points on a line (vertical or horizontal)
     * @returns {boolean}
     * @param y1
     * @param y2
     * @param x
     */
    const checkLineX = (y1, y2, x) => {
        const yleft = Math.min(y1, y2);
        const yright = Math.max(y1, y2);
        const tmp = [];

        for (let yi = yleft + 1; yi < yright; yi++) {
            if (tiles[x][yi] !== 0) {
                return false;
            }

            tmp.push({x: x, y: yi, value: "horizontal"});
        }

        lines.push(...tmp);
        return true;
    };
    const checkLineY = (x1, x2, y) => {
        const xup = Math.min(x1, x2);
        const xdown = Math.max(x1, x2);
        const tmp = [];

        for (let xi = xup + 1; xi < xdown; xi++) {
            if (tiles[xi][y] !== 0) {
                return false;
            }
            tmp.push({x: xi, y: y, value: "vertical"});
        }

        lines.push(...tmp);
        return true;
    };

    /**
     * @description test if two points in bound of the rectangle
     * @param p1: 1st point
     * @param p2: 2nd point
     * @returns {boolean}
     */
    const checkRectX = (p1, p2) => {
        let pleft = p1;
        let pright = p2;

        if (p1.y > p2.y) {
            pleft = p2;
            pright = p1;
        }

        lines = [];
        for (let yi = pleft.y + 1; yi < pright.y; yi++) {
            if (
                checkLineX(pleft.y, yi, pleft.x) &&
                checkLineY(pleft.x, pright.x, yi) &&
                checkLineX(yi, pright.y, pright.x) &&
                tiles[pleft.x][yi] === 0 &&
                tiles[pright.x][yi] === 0
            ) {
                if (pleft.x > pright.x) {
                    lines.push(
                        {x: pleft.x, y: yi, value: "top_left"},
                        {x: pright.x, y: yi, value: "bottom_right"}
                    );
                } else {
                    lines.push(
                        {x: pleft.x, y: yi, value: "bottom_left"},
                        {x: pright.x, y: yi, value: "top_right"}
                    );
                }

                return true;
            }
        }

        return false;
    };
    const checkRectY = (p1, p2) => {
        let pup = p1;
        let pdown = p2;

        if (p1.x > p2.x) {
            pup = p2;
            pdown = p1;
        }

        lines = [];
        for (let xi = pup.x + 1; xi < pdown.x; xi++) {
            if (
                checkLineY(pup.x, xi, pup.y) &&
                checkLineX(pup.y, pdown.y, xi) &&
                checkLineY(xi, pdown.x, pdown.y) &&
                tiles[xi][pup.y] === 0 &&
                tiles[xi][pdown.y] === 0
            ) {
                if (pup.y > pdown.y) {
                    lines.push(
                        {x: xi, y: pup.y, value: "top_left"},
                        {x: xi, y: pdown.y, value: "bottom_right"}
                    );
                } else {
                    lines.push(
                        {x: xi, y: pup.y, value: "top_right"},
                        {x: xi, y: pdown.y, value: "bottom_left"}
                    );
                }

                return true;
            }
        }

        return false;
    };

    /**
     * @description test if tow point in edge of rectangle
     * @param p1: 1st point
     * @param p2: 2nd point
     * @returns {boolean}
     */
    const checkEdge = (p1, p2) => {
        let pleft = p1;
        let pright = p2;

        if (p1.y > p2.y) {
            pleft = p2;
            pright = p1;
        }

        let p = {x: pright.x, y: pleft.y};
        if (tiles[p.x][p.y] === 0) {
            lines = [];

            if (checkLineX(p.y, pright.y, p.x) && checkLineY(p.x, pleft.x, p.y)) {
                if (pleft.x > pright.x) {
                    lines.push({x: p.x, y: p.y, value: "bottom_right"});
                } else {
                    lines.push({x: p.x, y: p.y, value: "top_right"});
                }
                return true;
            }
        }

        lines = [];
        p = {x: pleft.x, y: pright.y};
        if (tiles[p.x][p.y] !== 0) return false;

        if (checkLineX(p.y, pleft.y, p.x) && checkLineY(p.x, pright.x, p.y)) {
            if (pleft.x > pright.x) {
                lines.push({x: p.x, y: p.y, value: "top_left"});
            } else {
                lines.push({x: p.x, y: p.y, value: "bottom_left"});
            }
            return true;
        }

        return false;
    };

    /**
     * @description test if two points out of bound of the rectangle
     * @param p1: 1st point
     * @param p2: 2nd point
     * @param maxY
     * @returns {boolean}
     */
    const checkExtendX = (p1, p2, maxY) => {
        let pleft = p1;
        let pright = p2;

        if (p1.y > p2.y) {
            pleft = p2;
            pright = p1;
        }

        // left to right
        lines = [];
        for (let yi = pleft.y + 1; yi <= pright.y; yi++) {
            lines.push({x: pleft.x, y: yi, value: "horizontal"});
        }

        for (let yi = pright.y + 1; yi <= maxY + 1; yi++) {
            lines.push(
                {x: pleft.x, y: yi, value: "horizontal"},
                {x: pright.x, y: yi, value: "horizontal"}
            );

            if (
                checkLineX(pleft.y, yi, pleft.x) &&
                checkLineX(pright.y, yi, pright.x) &&
                checkLineY(pleft.x, pright.x, yi) &&
                tiles[pleft.x][yi] === 0 &&
                tiles[pright.x][yi] === 0
            ) {
                if (pleft.x > pright.x) {
                    lines.push(
                        {x: pleft.x, y: yi, value: "top_left"},
                        {x: pright.x, y: yi, value: "bottom_left"}
                    );
                } else {
                    lines.push(
                        {x: pleft.x, y: yi, value: "bottom_left"},
                        {x: pright.x, y: yi, value: "top_left"}
                    );
                }

                return true;
            }
        }

        // right to left
        lines = [];
        for (let yi = pright.y - 1; yi >= pleft.y; yi--) {
            lines.push({x: pright.x, y: yi, value: "horizontal"});
        }
        for (let yi = pleft.y - 1; yi >= 0; yi--) {
            lines.push(
                {x: pleft.x, y: yi, value: "horizontal"},
                {x: pright.x, y: yi, value: "horizontal"}
            );

            if (
                checkLineX(pleft.y, yi, pleft.x) &&
                checkLineX(pright.y, yi, pright.x) &&
                checkLineY(pleft.x, pright.x, yi) &&
                tiles[pleft.x][yi] === 0 &&
                tiles[pright.x][yi] === 0
            ) {
                if (pleft.x > pright.x) {
                    lines.push(
                        {x: pleft.x, y: yi, value: "top_right"},
                        {x: pright.x, y: yi, value: "bottom_right"}
                    );
                } else {
                    lines.push(
                        {x: pleft.x, y: yi, value: "bottom_right"},
                        {x: pright.x, y: yi, value: "top_right"}
                    );
                }
                return true;
            }
        }

        return false;
    };
    const checkExtendY = (p1, p2, maxX) => {
        let pup = p1;
        let pdown = p2;

        if (p1.x > p2.x) {
            pup = p2;
            pdown = p1;
        }

        // up to down
        lines = [];
        for (let xi = pup.x + 1; xi <= pdown.x; xi++) {
            lines.push({x: xi, y: pup.y, value: "vertical"});
        }

        for (let xi = pdown.x + 1; xi <= maxX + 1; xi++) {
            lines.push(
                {x: xi, y: pup.y, value: "vertical"},
                {x: xi, y: pdown.y, value: "vertical"}
            );
            if (
                checkLineY(pup.x, xi, pup.y) &&
                checkLineY(pdown.x, xi, pdown.y) &&
                checkLineX(pup.y, pdown.y, xi) &&
                tiles[xi][pup.y] === 0 &&
                tiles[xi][pdown.y] === 0
            ) {
                if (pup.y > pdown.y) {
                    lines.push(
                        {x: xi, y: pup.y, value: "top_left"},
                        {x: xi, y: pdown.y, value: "top_right"}
                    );
                } else {
                    lines.push(
                        {x: xi, y: pup.y, value: "top_right"},
                        {x: xi, y: pdown.y, value: "top_left"}
                    );
                }
                return true;
            }
        }

        // down to up
        lines = [];
        for (let xi = pdown.x - 1; xi >= pup.x; xi--) {
            lines.push({x: xi, y: pdown.y, value: "vertical"});
        }
        for (let xi = pup.x - 1; xi >= 0; xi--) {
            lines.push(
                {x: xi, y: pup.y, value: "vertical"},
                {x: xi, y: pdown.y, value: "vertical"}
            );
            if (
                checkLineY(pup.x, xi, pup.y) &&
                checkLineY(pdown.x, xi, pdown.y) &&
                checkLineX(pup.y, pdown.y, xi) &&
                tiles[xi][pup.y] === 0 &&
                tiles[xi][pdown.y] === 0
            ) {
                if (pup.y > pdown.y) {
                    lines.push(
                        {x: xi, y: pup.y, value: "bottom_left"},
                        {x: xi, y: pdown.y, value: "bottom_right"}
                    );
                } else {
                    lines.push(
                        {x: xi, y: pup.y, value: "bottom_right"},
                        {x: xi, y: pdown.y, value: "bottom_left"}
                    );
                }
                return true;
            }
        }

        return false;
    };

    /**
     * @param p1
     * @param p2
     * @returns Can be paired or not. True: Can be paired. False: Cannot.
     */
    const isPair = (p1, p2) => {
        if (!p1 || !p2) {
            throw Error("p1, p2 values are required");
        }

        const x1 = p1.x;
        const y1 = p1.y;

        const x2 = p2.x;
        const y2 = p2.y;

        if (tiles[x1][y1] !== tiles[x2][y2] || (x1 === x2 && y1 === y2))
            return false;

        // Case 1: On the same row
        if (x1 === x2 && checkLineX(y1, y2, x1)) return true;

        // Case 2: On the same col
        if (y1 === y2 && checkLineY(x1, x2, y1)) return true;

        // Case 3+4: two points int edge of the rectangle
        if (checkEdge(p1, p2)) return true;

        // Case 5: two points in bound of the rectangle
        if (checkRectX(p1, p2)) return true;

        if (checkRectY(p1, p2)) return true;

        // Case6: two points out of bound of the rectangle
        if (checkExtendX(p1, p2, colNum)) return true;

        return checkExtendY(p1, p2, 8);
    };

    function isExist() {
        count = 0; // reset count

        // Initialize 2d array
        satisfiableItems = [...new Array(champs + 1)].fill(null).map(() => []);

        // Iterate each item
        for (let i = 1; i < listPosItem.length; i++) {
            // Case 1: 0 item
            if (
                !listPosItem[i] ||
                listPosItem[i].length === 0 ||
                !listPosItem[i].length
            )
                continue;

            // Case 2: 2, 4, 6... items
            for (let j = 0; j < listPosItem[i].length; j++) {
                for (let k = j + 1; k < listPosItem[i].length; k++) {
                    if (isPair(listPosItem[i][j], listPosItem[i][k])) {
                        satisfiableItems[i].push({
                            champ1: listPosItem[i][j],
                            champ2: listPosItem[i][k],
                            lines: lines,
                            item1: j,
                            item2: k,
                        });
                        count++;
                    }
                }
            }
        }
        return count > 0;
    }

    const reloadHandler = () => {
        const oldTiles = [...tiles];
        const _newTiles = reloadBoard(oldTiles, 8, colNum, champs);
        setTiles(_newTiles);
        listPosItem = getListPosItem(_newTiles, 8, colNum, champs);
        setIsJustReloaded(true);
    };

    // const renew = () => {
    //   const _newTiles = getBoard(8, colNum, champs);
    //   setTiles(_newTiles);
    //   setStatus("play");
    //   setChamp1(null);
    //   setChamp2(null);
    //   setFromChamps(mixChampions());
    //   setTilesDone(0);
    //   if (timer) restart(getExpiredTime(duration));
    // };

    React.useEffect(() => {
        if (!isExist()) {
            reloadHandler();
        }

        // When board is renew
        if (isNew === true) {
            if (!isExist()) {
                reloadHandler();
            }
            setIsNew(false);
        }

        // When board is reloaded
        if (isJustReloaded === true) {
            if (!isExist()) {
                reloadHandler();
            }
            setIsJustReloaded(false);
        }

        // Round 5: Check reload board
        if (isWillReload === true) {
            // update item's position array
            listPosItem = getListPosItem(newTiles, 8, colNum, champs);

            if (!isExist()) {
                reloadHandler();
            }
            setIsWillReload(false);
            return;
        }

        // Round 4: Remove line from board
        if (doneLine) {
            lastLines.map((line) => (newTiles[line.x][line.y] = 0));

            newTiles[champ1.x][champ1.y] = newTiles[champ2.x][champ2.y] = 0;
            lastLines = [];

            setTimeout(() => {
                setTiles(newTiles);
                setChamp1(null);
                setChamp2(null);
                setIsWillReload(true);
            }, 500);

            doneLine = false;
            return;
        }

        // Round 3: Display connected line
        if (hasLine) {
            hasLine = false;
            doneLine = true;
            setTiles(newTiles);
            return;
        }

        // Round 1: Check if 2 items is valid (not null) or not
        if (champ1 && champ2) {
            newTiles = [...tiles];
            const value = newTiles[champ1.x][champ1.y];
            // Round 2: Check if 2 items is satisfiable or not. If yes then update score and assign lastLines value
            for (let i = 0; i < satisfiableItems[value].length; i++) {
                // compare two object
                if (
                    (satisfiableItems[value][i].champ1.x === champ1.x &&
                        satisfiableItems[value][i].champ1.y === champ1.y &&
                        satisfiableItems[value][i].champ2.x === champ2.x &&
                        satisfiableItems[value][i].champ2.y === champ2.y) ||
                    (satisfiableItems[value][i].champ2.x === champ1.x &&
                        satisfiableItems[value][i].champ2.y === champ1.y &&
                        satisfiableItems[value][i].champ1.x === champ2.x &&
                        satisfiableItems[value][i].champ1.y === champ2.y)
                ) {
                    lastLines = satisfiableItems[value][i].lines.slice();

                    if (lastLines.length) {
                        lastLines.map((line) => (newTiles[line.x][line.y] = line.value));
                    }

                    setTilesDone((prev) => prev + 2);

                    hasLine = true;

                    // Remove from listPosItems
                    listPosItem[value][satisfiableItems[value][i].item1] =
                        listPosItem[value][listPosItem[value].length - 1];
                    listPosItem[value].pop();
                    listPosItem[value][satisfiableItems[value][i].item2] =
                        listPosItem[value][listPosItem[value].length - 1];
                    listPosItem[value].pop();

                    // Remove couple from satisfiableItems array
                    satisfiableItems[value][i] =
                        satisfiableItems[value][satisfiableItems[value].length - 1];
                    satisfiableItems[value].pop();
                    count--;
                    // console.log(isPair(champ1, champ2), isExist());
                    return;
                }
            }
            // console.log(isPair(champ1, champ2));

            lines = [];
            setChamp1(null);
            setChamp2(null);
        }
    }, [champ1, champ2, tiles]);

    return (
        <Box sx={{width: "100%"}}>
            <Button variant="contained" onClick={() => handleOnIdle()}>
                Idle
            </Button>
            {timer && <GameTimer/>}
            <Box alignItems="center" display="flex" flexDirection="column" p={2}>
                <Tiles/>
            </Box>
        </Box>
    );
}