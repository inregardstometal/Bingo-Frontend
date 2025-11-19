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
    InputAdornment,
    Tooltip,
    Input,
    Switch
} from "@mui/material";
import { Close, Add, Settings, FileUploadOutlined } from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBingoState, useTerms, PageFormats } from "./BingoState";
import { generateSheets } from "../../utils/generateSheets";
import { createDocument } from "../../utils/createDocument";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { getValue } from "@testing-library/user-event/dist/utils";
import { TermList } from "./TermList";

export const BingoController = (): React.JSX.Element => {
    const bingo = useBingoState();
    const [termField, setTermField] = useState<string>("");
    const terms = useTerms();
    const [open, setOpen] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [termSetName, setTermSetName] = useState<string>("");

    const [numberOfSheets, setNumberOfSheets] = useState<number>(5);

    useEffect(() => {
        if (bingo.state.activeTermSet) {
            setTermSetName(bingo.state.activeTermSet);
        }
    }, [bingo.state.activeTermSet]);

    const addTerm = useCallback(
        (e?: React.FormEvent<HTMLFormElement>) => {
            e?.preventDefault();
            if (termField === "") return;
            bingo.methods.addTerm(termField);
            setTermField("");
        },
        [termField, bingo.methods.addTerm]
    );

    const { containerRef, bonus } = bingo.state;

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
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title="Add Term">
                                    <IconButton onClick={() => addTerm()} color="primary">
                                        <Add />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}
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
                            checked={bingo.state.bonus}
                            onChange={() => bingo.methods.setBonus(!bingo.state.bonus)}
                        />
                    }
                    label="Bonus Square"
                />
                <TextField
                    fullWidth
                    select
                    size="small"
                    label="Squares per side"
                    value={bingo.state.sideLength}
                    onChange={(e) => bingo.methods.setSideLength(+e.target.value)}
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
                <Button variant="contained" onClick={bingo.methods.regenerate}>
                    Refresh Board
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        bingo.methods.clearTerms();
                        bingo.methods.setTermSet(null);
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
                    value={bingo.state.activeTermSet ?? ""}
                    onChange={(e) =>
                        bingo.methods.setTermSet(e.target.value === "" ? null : e.target.value)
                    }
                    label="Term Set"
                    fullWidth
                    SelectProps={{
                        displayEmpty: true,
                        renderValue: (val) => (val ? <>{val as string}</> : <i>No Term Set</i>),
                    }}
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() => {
                                    bingo.methods.clearTerms();
                                    bingo.methods.setTermSet(null);
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
                    {bingo.state.termSets.map((set) => (
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
                    onClick={() => bingo.methods.writeTerms(termSetName)}
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
            >
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        py: "4px",
                    }}
                >
                    <Button
                        variant="contained"
                        color="success"
                        onClick={printSheets}
                        sx={{ flexGrow: 1, mr: "4px" }}
                    >
                        Generate Sheets
                    </Button>
                    <Tooltip title="Sheet Settings">
                        <IconButton
                            onClick={() => setOpen((prev) => !prev)}
                            sx={{ aspectRatio: "1/1" }}
                        >
                            <Settings />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Collapse in={open}>
                    <TextField
                        label="Bingo Name"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={bingo.state.name}
                        onChange={(e) => bingo.methods.setName(e.target.value)}
                    />
                    <TextField
                        label="Subtitle"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={bingo.state.subtitle}
                        onChange={(e) => bingo.methods.setSubtitle(e.target.value)}
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
                        value={bingo.state.margin}
                        onChange={(e) =>
                            bingo.methods.setMargin(isNaN(+e.target.value) ? 0 : +e.target.value)
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
                        value={bingo.state.fontScale}
                        onChange={(e, v) => bingo.methods.setFontScale(v as number)}
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
                        value={bingo.state.numPerPage}
                        onChange={(e) => bingo.methods.setNumPerPage(+e.target.value as 1 | 2 | 4)}
                    >
                        <MenuItem value={1} disabled={bingo.state.orientation === "landscape"}>
                            1
                        </MenuItem>
                        <MenuItem value={2} disabled={bingo.state.orientation === "portrait"}>
                            2
                        </MenuItem>
                        <MenuItem value={4} disabled={bingo.state.orientation === "landscape"}>
                            4
                        </MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Format"
                        margin="dense"
                        fullWidth
                        size="small"
                        value={bingo.state.format}
                        onChange={(e) => bingo.methods.setFormat(e.target.value as PageFormats)}
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
                        value={bingo.state.orientation}
                        onChange={(e) =>
                            bingo.methods.setOrientation(e.target.value as typeof bingo.state.orientation)
                        }
                    >
                        <MenuItem value="portrait">portrait</MenuItem>
                        <MenuItem value="landscape">landscape</MenuItem>
                    </TextField>
                    <TextField
                        type="text"
                        size="small"
                        label="Background Image"
                        margin="dense"
                        fullWidth
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        InputLabelProps={{ shrink: true }}
                        value={bingo.state.backgroundImage ?? ""}
                        InputProps={{
                            endAdornment: (
                                <IconButton component="label" onClick={bingo.state.backgroundImage ? (e) => { e.stopPropagation(); e.preventDefault(); bingo.methods.setBackgroundImage(null); } : undefined}>
                                    {bingo.state.backgroundImage ? <Close /> : <>
                                        <FileUploadOutlined />
                                        <input
                                            ref={fileInputRef}
                                            style={{ display: "none" }}
                                            type="file"
                                            hidden
                                            onChange={(e) => bingo.methods.setBackgroundImage(URL.createObjectURL(new Blob([...(e.target.files ?? [])])))}
                                            name="file"
                                        /></>}
                                </IconButton>
                            ),
                        }}
                    />
                    <Typography
                        sx={{ color: "text.secondary", width: "100%", padding: "0 14px" }}
                        variant="caption"
                    >
                        Background Image Transparency
                    </Typography>
                    <Slider
                        sx={{ width: "90%" }}
                        value={bingo.state.backgroundImageTransparency}
                        onChange={(e, v) => bingo.methods.setBackgroundImageTransparency(v as number)}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                    <FormControlLabel control={<Switch value={bingo.state.stretchToFit} onChange={() => bingo.methods.setStretchToFit((prev) => !prev)}/>} label="Stretch To Fit"/>
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
            <TermList terms={terms} removeTerm={bingo.methods.removeTerm} />
        </Box>
    );
};
