import { Box } from "@mui/material";
import { BingoStateProvider, useKey } from "./BingoState";
import { BingoBoard } from "./BingoBoard";
import { BingoPage } from "./BingoPage";
import { BingoController } from "./BingoController";

export const Bingo = (): JSX.Element => {
    const key = useKey();

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <BingoPage key={key} />
            <BingoController />
        </Box>
    );
};
