import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useBingoViewState, FormatRatios, useFontScale } from "./BingoState";
import { BingoBoard } from "./BingoBoard";

interface BingoPageProps {}

const SCALE_FACTOR = 0.02;

export const BingoPage = ({}: BingoPageProps): React.JSX.Element => {
    const { containerRef, format, orientation, numPerPage, backgroundImage } = useBingoViewState();

    const fontScale = useFontScale();

    const [dim, setDim] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            const ob = new ResizeObserver(() => {
                if (containerRef.current) {
                    setDim([
                        containerRef.current.clientWidth,
                        containerRef.current.clientHeight,
                    ]);
                }
            });

            ob.observe(containerRef.current);

            return () => {
                ob.disconnect();
            };
        }
    }, []);

    const ratio = useMemo(() => {
        const x = FormatRatios[format][0];
        const y = FormatRatios[format][1];

        return orientation === "portrait" ? x / y : y / x;
    }, [format, orientation]);

    const fontSize = useMemo(() => {
        if (dim) {
            const min = Math.min(dim[0], dim[1]);

            const baseSize = (min * SCALE_FACTOR) / Math.sqrt(numPerPage);

            if (fontScale && !isNaN(fontScale)) {
                return Math.round(baseSize * fontScale);
            } else {
                return Math.round(baseSize);
            }
        } else {
            return 16;
        }
    }, [dim, numPerPage, fontScale]);

    const gridConfig: CSSProperties = useMemo(() => {
        if (numPerPage === 1) {
            return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" };
        } else if (numPerPage === 2) {
            return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" };
        } else {
            return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
        }
    }, [numPerPage]);

    const boards = useMemo(() => {
        return [...Array(numPerPage).keys()].map((key) => <BingoBoard key={key} />);
    }, [numPerPage]);

    return (
        <Box
            sx={{
                display: "flex",
                flexGrow: 1,
                height: "100%",
                justifyContent: "safe center",
                alignItems: "safe center",
                bgcolor: "#9d9fa8",
                // padding: "16px",
                overflow: "auto",
                padding: "15px",
            }}
        >
            <Box
                ref={containerRef}
                sx={{
                    bgcolor: "white",
                    
                    width: orientation === "landscape" ? "100%" : "unset",
                    height: orientation === "portrait" ? "100%" : "unset",
                    aspectRatio: `${ratio}`,
                    boxShadow: "3px 3px 7px 0px rgba(0,0,0,0.75)",
                    fontSize: `${fontSize}px`,
                    "*": {
                        fontFamily: "Century Gothic !important",
                    },
                    "@media print": {
                        "&": {
                            boxShadow: "unset",
                        },
                    },
                    display: "grid",
                    ...gridConfig,
                }}
            >
                {boards}
            </Box>
        </Box>
    );
};
