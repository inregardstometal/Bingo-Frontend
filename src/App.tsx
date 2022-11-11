import { Box } from "@mui/material";
import { BingoWrapper } from "components/Bingo/BingoWrapper";

export const App = (): JSX.Element => {
    return (
        <Box sx={{ width: "100%", height: "100%" }}>
            <BingoWrapper />
        </Box>
    );
};
