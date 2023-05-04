import { Close, Filter, FilterAlt } from "@mui/icons-material";
import {
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListSubheader,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface TermListProps {
    terms: string[];
    removeTerm: (term: string) => void;
}

export const TermList = ({ terms, removeTerm }: TermListProps): JSX.Element => {
    const [filterActive, setFilterActive] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>("");
    const [filteredTerms, setFilteredTerms] = useState<string[]>([]);

    useEffect(() => {
        if (filter !== "") {
            setFilteredTerms(
                terms.filter((term) => term.toLowerCase().includes(filter.toLowerCase()))
            );
        } else {
            setFilteredTerms(terms);
        }
    }, [terms, filter]);

    useEffect(() => {
        if (!filterActive) setFilter("");
    }, [filterActive]);

    return (
        <List
            // dense
            sx={{
                position: "relative",
                minWidth: "0px",
                flexGrow: 1,
                overflowY: "auto",
                li: {
                    padding: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                },
            }}
            subheader={
                <ListItem
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        position: "sticky",
                        top: 0,
                        bgcolor: "white",
                        zIndex: 2,
                    }}
                    secondaryAction={
                        !filterActive && (
                            <IconButton size="small" onClick={() => setFilterActive(true)}>
                                <FilterAlt />
                            </IconButton>
                        )
                    }
                >
                    {filterActive ? (
                        <TextField
                            size="small"
                            fullWidth
                            label={`Filter Terms (${filteredTerms.length})`}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Filter Terms">
                                            <IconButton
                                                size="small"
                                                onClick={() => setFilterActive(false)}
                                            >
                                                <Close />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    ) : (
                        <Typography sx={{ height: "40px", lineHeight: "40px" }}>
                            Terms {`(${terms.length})`}
                        </Typography>
                    )}
                </ListItem>
            }
        >
            {filteredTerms.map((term) => (
                <ListItem
                    title={term}
                    key={term}
                    secondaryAction={
                        <IconButton onClick={() => removeTerm(term)} size="small">
                            <Close />
                        </IconButton>
                    }
                >
                    {term}
                </ListItem>
            ))}
        </List>
    );
};
