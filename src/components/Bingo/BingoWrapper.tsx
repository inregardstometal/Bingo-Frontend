import { Bingo } from "./Bingo";
import { BingoStateProvider } from "./BingoState";

export const BingoWrapper = (): React.JSX.Element => {
    return (
        <BingoStateProvider>
            <Bingo />
        </BingoStateProvider>
    );
};
