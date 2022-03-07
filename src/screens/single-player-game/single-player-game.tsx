import React, { ReactElement, useState, useEffect } from "react";
import { SafeAreaView } from "react-native";
import styles from "./single-player-game.styles";
import { Board, GradientBackground } from "@components";
import { isEmpty, BoardState, isTerminal, getBestMove, Cell, useSounds } from "@utils";

export default function SinglePlayerGame(): ReactElement {
    // prettier-ignore
    const [state, setState] = useState<BoardState>([
        null, null, null,
        null, null, null,
        null, null, null,
    ]);
    const [turn, setTurn] = useState<"HUMAN" | "BOT">(Math.random() < 0.5 ? "HUMAN" : "BOT");
    const [isHumanMaximizing, setIsHumanMaximizing] = useState<boolean>(true);

    const playSound = useSounds();

    const gameResult = isTerminal(state);

    const insertCell = (cell: number, symbol: "x" | "o"): void => {
        const stateCopy: BoardState = [...state];
        if (stateCopy[cell] || isTerminal(stateCopy)) return;
        stateCopy[cell] = symbol;
        setState(stateCopy);

        try {
            symbol === "x" ? playSound("pop1") : playSound("pop2");
        } catch (error) {
            console.log(error);
        }
    };

    const handleOnCellPressed = (cell: number): void => {
        if (turn !== "HUMAN") return;
        insertCell(cell, isHumanMaximizing ? "x" : "o");
        setTurn("BOT");
    };

    const getWinner = (winnerSymbol: Cell): "HUMAN" | "BOT" | "DRAW" => {
        if (winnerSymbol === "x") {
            return isHumanMaximizing ? "HUMAN" : "BOT";
        }
        if (winnerSymbol === "o") {
            return isHumanMaximizing ? "BOT" : "HUMAN";
        }
        return "DRAW";
    };

    useEffect(() => {
        if (gameResult) {
            // handle game finished
            const winner = getWinner(gameResult.winner);
            if (winner === "HUMAN") {
                playSound("win");
                alert("You Won!");
            }
            if (winner === "BOT") {
                playSound("loss");
                alert("You Lost!");
            }
            if (winner === "DRAW") {
                playSound("draw");
                alert("It's a Draw!");
            }
        } else {
            if (turn === "BOT") {
                if (isEmpty(state)) {
                    const centersAndCorners = [0, 2, 6, 8, 4];
                    const firstMove =
                        centersAndCorners[Math.floor(Math.random() * centersAndCorners.length)];
                    insertCell(firstMove, "x");
                    setIsHumanMaximizing(false);
                    setTurn("HUMAN");
                } else {
                    // setting difficulty - 1 for easy, -1 for hard
                    const best = getBestMove(state, !isHumanMaximizing, 0, -1);
                    insertCell(best, isHumanMaximizing ? "o" : "x");
                    setTurn("HUMAN");
                }
            }
        }
    }, [state, turn]);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    disabled={Boolean(isTerminal(state)) || turn !== "HUMAN"}
                    onCellPressed={cell => {
                        handleOnCellPressed(cell);
                    }}
                    state={state}
                    size={300}
                />
            </SafeAreaView>
        </GradientBackground>
    );
}
