import { Bingo } from "./Bingo";
import { BingoStateProvider } from "./BingoState";

export const BingoWrapper = (): JSX.Element => {
    return (
        <BingoStateProvider>
            <Bingo />
        </BingoStateProvider>
    );
};
