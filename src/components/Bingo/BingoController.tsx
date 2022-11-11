import {
    Box,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Checkbox,
    FormControlLabel,
    Button,
    MenuItem,
    Divider,
    Slider,
    InputLabel,
    Typography,
    Collapse,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { useBingoState, useTerms, PageFormats } from "./BingoState";
import { generateSheets } from "./generateSheets";
import { createDocument } from "./createDocument";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { getValue } from "@testing-library/user-event/dist/utils";

export const BingoController = (): JSX.Element => {
    const state = useBingoState();
    const [termField, setTermField] = useState<string>("");
    const terms = useTerms();
    const [open, setOpen] = useState<boolean>(false);

    const [termSetName, setTermSetName] = useState<string>("");

    const [numberOfSheets, setNumberOfSheets] = useState<number>(5);

    useEffect(() => {
        if (state.activeTermSet) {
            setTermSetName(state.activeTermSet);
        }
    }, [state.activeTermSet]);

    const addTerm: React.FormEventHandler<HTMLFormElement> = useCallback(
        (e) => {
            e.preventDefault();
            if (termField === "") return;
            state.addTerm(termField);
            setTermField("");
        },
        [termField, state]
    );

    const { containerRef, bonus } = state;

    const printSheets = useCallback(async () => {
        const container = containerRef.current;

        if (container) {
            const sheets = generateSheets(container, numberOfSheets, terms, bonus);

            const newWindow = window.open("")!;

            const docs = createDocument(sheets);

            newWindow.document.write(docs.outerHTML);
            newWindow.print();
            newWindow.close();
        }
    }, [containerRef, bonus, terms, numberOfSheets]);

    const openSheetsAsHTML = useCallback(async () => {
        const container = containerRef.current;

        if (container) {
            const sheets = generateSheets(container, numberOfSheets, terms, bonus);

            const docs = createDocument(sheets);

            const blob = new Blob([docs.outerHTML], { type: "text/html" });

            const url = URL.createObjectURL(blob);

            window.open(url, "_blank");

            URL.revokeObjectURL(url);
        }
    }, [containerRef, bonus, terms, numberOfSheets]);

    return (
        <Box
            sx={{
                borderLeft: "1px solid",
                borderColor: "text.primary",
                display: "flex",
                flexDirection: "column",
                width: "40%",
                maxWidth: "350px",
                minWidth: "250px",
                height: "100%",
                padding: "10px",
            }}
        >
            <form onSubmit={addTerm}>
                <TextField
                    fullWidth
                    value={termField}
                    onChange={(e) => setTermField(e.target.value)}
                    label="Add Term"
                />
            </form>
            <Divider />
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                }}
            >
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.bonus}
                            onChange={() => state.setBonus(!state.bonus)}
                        />
                    }
                    label="Bonus Square"
                />
                <TextField
                    fullWidth
                    select
                    size="small"
                    label="Squares per side"
                    value={state.sideLength}
                    onChange={(e) => state.setSideLength(+e.target.value)}
                >
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={11}>11</MenuItem>
                </TextField>
            </Box>
            <Divider />

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                }}
            >
                <Button variant="contained" onClick={state.regenerate}>
                    Refresh Board
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        state.clearTerms();
                        state.setTermSet(null);
                    }}
                    color="error"
                >
                    Clear Terms
                </Button>
            </Box>
            <Divider />

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                }}
            >
                <TextField
                    select
                    size="small"
                    value={state.activeTermSet ?? ""}
                    onChange={(e) =>
                        state.setTermSet(e.target.value === "" ? null : e.target.value)
                    }
                    label="Term Set"
                    fullWidth
                    SelectProps={{
                        displayEmpty: true,
                        renderValue: (val) => (val ? <>{val}</> : <i>No Term Set</i>),
                    }}
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() => {
                                    state.clearTerms();
                                    state.setTermSet(null);
                                }}
                                size="small"
                                sx={{ marginRight: "10px" }}
                            >
                                <Close />
                            </IconButton>
                        ),
                    }}
                    InputLabelProps={{ shrink: true }}
                >
                    {state.termSets.map((set) => (
                        <MenuItem key={set} value={set}>
                            {set}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => state.writeTerms(termSetName)}
                    sx={{ marginRight: "5px" }}
                >
                    Save
                </Button>
                <TextField
                    fullWidth
                    size="small"
                    value={termSetName}
                    onChange={(e) => setTermSetName(e.target.value)}
                    label="Term Set Name"
                />
            </Box>
            <Divider />
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    padding: "0 10px",
                }}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={printSheets}
                    sx={{ margin: "4px" }}
                >
                    Generate Sheets
                </Button>
                <Collapse in={open}>
                    <TextField
                        label="Bingo Name"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={state.name}
                        onChange={(e) => state.setName(e.target.value)}
                    />
                    <TextField
                        label="Number of Pages"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={numberOfSheets}
                        onChange={(e) =>
                            setNumberOfSheets(isNaN(+e.target.value) ? 0 : +e.target.value)
                        }
                        inputProps={{
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Margin"
                        margin="dense"
                        size="small"
                        value={state.margin}
                        onChange={(e) =>
                            state.setMargin(isNaN(+e.target.value) ? 0 : +e.target.value)
                        }
                        InputProps={{ endAdornment: "px" }}
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    />
                    <Typography
                        sx={{ color: "text.secondary", width: "100%", padding: "0 14px" }}
                        variant="caption"
                    >
                        Font Scale
                    </Typography>
                    <Slider
                        sx={{ width: "90%" }}
                        value={state.fontScale}
                        onChange={(e, v) => state.setFontScale(v as number)}
                        min={0.1}
                        max={4}
                        step={0.1}
                    />
                    <TextField
                        select
                        label="Sheets Per Page"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={state.numPerPage}
                        onChange={(e) => state.setNumPerPage(+e.target.value as 1 | 2 | 4)}
                    >
                        <MenuItem value={1} disabled={state.orientation === "landscape"}>
                            1
                        </MenuItem>
                        <MenuItem value={2} disabled={state.orientation === "portrait"}>
                            2
                        </MenuItem>
                        <MenuItem value={4} disabled={state.orientation === "landscape"}>
                            4
                        </MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Format"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={state.format}
                        onChange={(e) => state.setFormat(e.target.value as PageFormats)}
                    >
                        {Object.entries(PageFormats).map(([key, value]) => (
                            <MenuItem key={value} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Orientation"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={state.orientation}
                        onChange={(e) =>
                            state.setOrientation(e.target.value as typeof state.orientation)
                        }
                    >
                        <MenuItem value="portrait">portrait</MenuItem>
                        <MenuItem value="landscape">landscape</MenuItem>
                    </TextField>
                </Collapse>
                {/* <Button
                    fullWidth
                    variant="contained"
                    onClick={openSheetsAsHTML}
                    sx={{ margin: "4px" }}
                >
                    Preview HTML
                </Button> */}
            </Box>
            <Divider />

            <List
                dense
                sx={{
                    padding: "10px",
                    minWidth: "0px",
                    flexGrow: 1,
                    overflowY: "auto",
                    li: {
                        padding: "10px",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        "&:first-of-type": {
                            borderTop: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Terms:
                </Typography>
                {terms.map((term) => (
                    <ListItem
                        title={term}
                        key={term}
                        secondaryAction={
                            <IconButton onClick={() => state.removeTerm(term)} size="small">
                                <Close />
                            </IconButton>
                        }
                    >
                        {term}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
