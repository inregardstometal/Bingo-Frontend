import { stat } from "fs/promises";
import {
    useState,
    useContext,
    createContext,
    useMemo,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { v4 } from "uuid";

export enum PageFormats {
    Let = 'Letter (8.5" x 11")',
    GovLet = 'Government Letter (8" x 10")',
    HalfLet = 'Half Letter (5.5" x 8.5")',
    A4 = "A4 (210mm x 297mm)",
}

export const FormatRatios: Record<PageFormats, [number, number]> = {
    [PageFormats.Let]: [1, 1.2941],
    [PageFormats.GovLet]: [1, 1.25],
    [PageFormats.HalfLet]: [1, 1.15455],
    [PageFormats.A4]: [1, 1.414],
};

interface BingoMethods {
    addTerm: (term: string) => void;
    removeTerm: (term: string) => void;
    clearTerms: () => void;
    pushError: (error: Error) => void;
    popError: (error: Error) => void;
    clearErrors: () => void;
    setBonus: (val: boolean) => void;
    setSideLength: (val: number) => void;
    regenerate: () => void;
    setTermSet: (name: string | null) => void;
    writeTerms: (termSetName: string) => void;
    setFormat: React.Dispatch<React.SetStateAction<PageFormats>>;
    setOrientation: React.Dispatch<React.SetStateAction<"portrait" | "landscape">>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setSubtitle: React.Dispatch<React.SetStateAction<string>>;
    setNumPerPage: React.Dispatch<React.SetStateAction<2 | 1 | 4>>;
    setMargin: React.Dispatch<React.SetStateAction<number>>;
    setFontScale: React.Dispatch<React.SetStateAction<number>>;
    setBackgroundImage: React.Dispatch<React.SetStateAction<string | null>>;
    setBackgroundImageTransparency: React.Dispatch<React.SetStateAction<number>>;
    setStretchToFit: React.Dispatch<React.SetStateAction<boolean>>;
}

interface BingoState {
    terms: Record<string, true>;
    errors: Error[];
    bonus: boolean;
    sideLength: number;
    key: string;
    termSets: string[];
    activeTermSet: string | null;
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    format: PageFormats;
    orientation: "portrait" | "landscape";
    name: string;
    subtitle: string;
    numPerPage: 1 | 2 | 4;
    margin: number;
    fontScale: number;
    backgroundImage: string | null;
    backgroundImageTransparency: number;
    stretchToFit: boolean;
}

type Bingo = { state: BingoState; methods: BingoMethods };

const BingoContext = createContext<Bingo>(null as unknown as Bingo);

interface BingoStateProviderProps {
    children: React.ReactNode | Iterable<React.ReactNode>;
}

const empty: [] = [];
const emptyObject: {} = {};

const TERM_STORAGE_KEY = "TERMS";

type StoredTerms = {
    [termSetName: string]: string[];
};

const STATE_STORAGE_KEY = "STATE";

type StoredState = {
    [stateName: string]: BingoState;
};

const storeState = (stateName: string, state: BingoState): void => {
    const storedState = localStorage.getItem(STATE_STORAGE_KEY);

    let stateRecord: StoredState = {};

    if (storedState) {
        stateRecord = JSON.parse(storedState);
    }

    stateRecord[stateName] = state;

    localStorage.setItem(TERM_STORAGE_KEY, JSON.stringify(stateRecord));
};

const getState = (stateName: string): BingoState => {
    const state = localStorage.getItem(STATE_STORAGE_KEY);

    if (!state) {
        throw new Error("state was not defined");
    }

    const stateRecord = JSON.parse(state) as StoredState;

    const targetState = stateRecord[stateName];

    if (!targetState) {
        throw new Error(`Couldn't find state with name ${stateName}`);
    }

    return targetState;
};

const getStates = () => {
    let states: string[] = [];

    try {
        const storedStates = localStorage.getItem(STATE_STORAGE_KEY);

        if (!storedStates) {
            return states;
        }

        const StateRecord = JSON.parse(storedStates) as StoredState;

        states = Object.keys(StateRecord);
    } catch (err) {
        console.error(err);
    }

    return states;
}

const storeTerms = (termSetName: string, terms: Record<string, true>): void => {
    const storedTerms = localStorage.getItem(TERM_STORAGE_KEY);

    let objectTerms: StoredTerms = {};

    if (storedTerms) {
        objectTerms = JSON.parse(storedTerms);
    }

    objectTerms[termSetName] = Object.keys(terms);

    localStorage.setItem(TERM_STORAGE_KEY, JSON.stringify(objectTerms));
};

const getTerms = (termSetName: string): Record<string, true> => {
    const terms: Record<string, true> = {};

    try {
        const storedTerms = localStorage.getItem(TERM_STORAGE_KEY);

        if (!storedTerms) {
            return terms;
        }

        const objectTerms = JSON.parse(storedTerms) as StoredTerms;

        const termArray = objectTerms[termSetName];

        if (!termArray) {
            return terms;
        }

        for (const term of termArray) {
            terms[term] = true;
        }
    } catch (err) {
        console.log(err);
    }

    return terms;
};

const getTermSets = (): string[] => {
    let termSets: string[] = [];

    try {
        const storedTerms = localStorage.getItem(TERM_STORAGE_KEY);

        if (!storedTerms) {
            return termSets;
        }

        const objectTerms = JSON.parse(storedTerms) as StoredTerms;

        termSets = Object.keys(objectTerms);
    } catch (err) {
        console.error(err);
    }

    return termSets;
};

export const BingoStateProvider = ({ children }: BingoStateProviderProps) => {
    const [bonus, setBonus] = useState<boolean>(true);
    const [sideLength, setSideLength] = useState<number>(5);
    const [terms, setTerms] = useState<Record<string, true>>({});
    const [errors, setErrors] = useState<Error[]>([]);
    const [key, setKey] = useState<string>(v4());
    const [termSets, setTermSets] = useState<string[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [activeTermSet, setActiveTermSet] = useState<string | null>(null);
    const [activeState, setActiveState] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [numPerPage, setNumPerPage] = useState<1 | 2 | 4>(1);
    const [name, setName] = useState<string>("");
    const [subtitle, setSubtitle] = useState<string>("");
    const [format, setFormat] = useState<PageFormats>(PageFormats.Let);
    const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
    const [margin, setMargin] = useState<number>(20);
    const [fontScale, setFontScale] = useState<number>(1);
    const [backgroundImage, _setBackgroundImage] = useState<string | null>(null);
    const [backgroundImageTransparency, setBackgroundImageTransparency] = useState<number>(0);
    const [stretchToFit, setStretchToFit] = useState<boolean>(false);

    useEffect(() => {
        setTermSets(getTermSets());
        setStates(getStates());
        if (activeTermSet) {
            setTerms(getTerms(activeTermSet));
        }
        if(activeState) {
            //rehydrate state
        }
    }, [activeTermSet]);

    useEffect(() => {
        if (orientation === "landscape" && (numPerPage === 1 || numPerPage === 4)) {
            setNumPerPage(2);
        } else if (orientation === "portrait" && numPerPage === 2) {
            setNumPerPage(1);
        }
    }, [numPerPage, orientation]);

    const pushError = useCallback((error: Error) => {
        setErrors((e) => [...e, error]);
    }, []);

    const popError = useCallback(() => {
        setErrors((e) => e.slice(0, -1));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors(empty);
    }, []);

    const addTerm = useCallback((term: string) => {
        setTerms((t) => {
            if (term in t) {
                pushError(new Error(`term ${term} already exists`));
                return t;
            } else {
                return { ...t, [term]: true };
            }
        });
    }, []);

    const removeTerm = useCallback((term: string) => {
        setTerms((t) => {
            if (!(term in t)) {
                pushError(new Error(`term ${term} isn't in the list of terms`));
                return t;
            } else {
                const temp = { ...t };
                delete temp[term];
                return temp;
            }
        });
    }, []);

    const clearTerms = useCallback(() => {
        setTerms(emptyObject);
    }, []);

    const regenerate = useCallback(() => {
        setKey(v4());
    }, []);

    const setTermSet = useCallback(
        (val: string | null) => {
            if (!val) {
                setActiveTermSet(val);
                return;
            }

            if (!termSets.includes(val)) {
                return;
            }

            setActiveTermSet(val);
        },
        [termSets]
    );

    const writeTerms = useCallback(
        (termSetName: string) => {
            if (Object.keys(terms).length !== 0) {
                storeTerms(termSetName, terms);
                setTermSets(getTermSets());
            }
        },
        [terms]
    );

    const setBackgroundImage: React.Dispatch<React.SetStateAction<string | null>> =
        useCallback((val) => {
            _setBackgroundImage((prev) => {
                if (typeof prev === "string") {
                    URL.revokeObjectURL(prev);
                }
                if (typeof val === "function") {
                    return val(prev);
                } else {
                    return val;
                }
            });
        }, []);

    const state = {
        terms,
        errors,
        bonus,
        sideLength,
        key,
        termSets,
        activeTermSet,
        containerRef,
        format,
        orientation,
        name,
        subtitle,
        numPerPage,
        margin,
        fontScale,
        backgroundImage,
        backgroundImageTransparency,
        stretchToFit,
    };

    const methods = {
        addTerm,
        removeTerm,
        clearTerms,
        pushError,
        popError,
        clearErrors,
        setBonus,
        setSideLength,
        regenerate,
        setTermSet,
        writeTerms,
        setFormat,
        setOrientation,
        setName,
        setSubtitle,
        setNumPerPage,
        setMargin,
        setFontScale,
        setBackgroundImage,
        setBackgroundImageTransparency,
        setStretchToFit,
    };

    const writeState = useCallback(
        (stateName: string) => {
            storeState(stateName, state);
        },
        [state]
    );

    const bingo: Bingo = {
        state,
        methods,
    };

    return <BingoContext.Provider value={bingo}>{children}</BingoContext.Provider>;
};

const nullCheck = (state: Bingo) => {
    if (!state) {
        throw new Error("BingoContext was null!");
    }
};

export const useKey = () => {
    const bingo = useContext(BingoContext);

    nullCheck(bingo);

    return bingo.state.key;
};

export const useTerms = () => {
    const bingo = useContext(BingoContext);

    nullCheck(bingo);

    return useMemo(() => Object.keys(bingo.state.terms), [bingo.state.terms]);
};

export const useFontScale = () => {
    const bingo = useContext(BingoContext);

    nullCheck(bingo);

    return bingo.state.fontScale;
};

export const useBingoViewState = () => {
    const bingo = useContext(BingoContext);

    nullCheck(bingo);

    return bingo.state;
};

export const useBingoState = () => {
    const bingo = useContext(BingoContext);

    nullCheck(bingo);

    return bingo;
};
