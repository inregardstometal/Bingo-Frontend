import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import {
    TableContainer,
    TableBody,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Box,
    Typography,
} from "@mui/material";
import { useTerms, useBingoViewState } from "./BingoState";
import { randomize } from "../../utils/randomize";

const SCALE_FACTOR = 0.02;

const MAX_FONT_SIZE = 28;

const BONUS_CONTENT = "<b>FREE SPACE</b>";

const _BingoBoard = (): React.JSX.Element => {
    const terms = useTerms();
    const {
        bonus,
        sideLength,
        name,
        subtitle,
        margin,
        backgroundImage,
        backgroundImageTransparency,
        stretchToFit,
        fontScale,
        numPerPage,
    } = useBingoViewState();

    const table = useMemo(() => {
        const area = Math.pow(sideLength, 2);
        const array = randomize(terms, area - +bonus);

        const bonusIndex = Math.ceil((area - 1) / 2);

        if (bonus) {
            array.splice(bonusIndex, 0, BONUS_CONTENT);
        }

        const _table: string[][] = [];

        for (let i = 0; i < sideLength; i++) {
            const arr: string[] = [];
            for (let j = 0; j < sideLength; j++) {
                arr.push(array[i * sideLength + j]);
            }
            _table.push(arr);
        }

        return _table;
    }, [terms, bonus, sideLength]);

    const tableRef = useRef<HTMLTableElement | null>(null);

    const [dim, setDim] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (tableRef.current) {
            const ob = new ResizeObserver(() => {
                if (tableRef.current) {
                    setDim([
                        tableRef.current.clientWidth,
                        tableRef.current.clientHeight,
                    ]);
                }
            });

            ob.observe(tableRef.current);

            return () => {
                ob.disconnect();
            };
        }
    }, []);


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

    return (
        <Box
            sx={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundColor: `rgba(255, 255, 255, ${backgroundImageTransparency})`,
                backgroundBlendMode: "lighten",
                backgroundRepeat: "no-repeat",
                backgroundSize: stretchToFit ? "cover" : "100%",
            }}
        >
            <Box
                sx={{
                    margin: `${margin}px`,
                }}
            >
                {name !== "" ? (
                    <Typography
                        variant="h3"
                        sx={{
                            width: "100%",
                            textAlign: "center",
                            margin: "10px 0",
                            mb: "16px",
                            fontWeight: 700,
                            fontSize: "32px",
                        }}
                    >
                        {name}
                    </Typography>
                ) : null}
                {subtitle !== "" ? (
                    <Typography
                        variant="h6"
                        sx={{
                            width: "100%",
                            textAlign: "center",
                            margin: "10px 0",
                            px: "80px",
                            fontWeight: 700,
                            fontSize: "20px",
                        }}
                    >
                        {subtitle}
                    </Typography>
                ) : null}
                <TableContainer
                    sx={{
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                    }}
                >
                    <Table
                        ref={tableRef}
                        sx={{
                            tableLayout: "fixed",
                            maxHeight: "100%",
                            maxWidth: "100%",
                            height: "100%",
                            width: "100%",
                            td: {
                                position: "relative",
                                overflow: "hidden",
                                textAlign: "center",
                                border: "2px solid",
                                borderColor: "black",
                                width: `${100 / sideLength}%`,
                                height: `${100 / sideLength}%`,
                                fontWeight: 600,
                            },
                        }}
                    >
                        <TableBody>
                            {table.map((row, i) => (
                                <TableRow key={i}>
                                    {row.map((cell, j) => (
                                        <TableCell key={j}>
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: `${fontSize}px`,
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    fontWeight: 700,
                                                }}
                                                dangerouslySetInnerHTML={
                                                    cell === BONUS_CONTENT
                                                        ? { __html: cell }
                                                        : undefined
                                                }
                                            >
                                                {cell !== BONUS_CONTENT ? cell : undefined}
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export const BingoBoard = memo(_BingoBoard);
