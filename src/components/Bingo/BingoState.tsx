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

interface BingoState {
    terms: Record<string, true>;
    addTerm: (term: string) => void;
    removeTerm: (term: string) => void;
    clearTerms: () => void;
    errors: Error[];
    pushError: (error: Error) => void;
    popError: (error: Error) => void;
    clearErrors: () => void;
    bonus: boolean;
    setBonus: (val: boolean) => void;
    sideLength: number;
    setSideLength: (val: number) => void;
    key: string;
    regenerate: () => void;
    termSets: string[];
    activeTermSet: string | null;
    setTermSet: (name: string | null) => void;
    writeTerms: (termSetName: string) => void;
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    format: PageFormats;
    setFormat: React.Dispatch<React.SetStateAction<PageFormats>>;
    orientation: "portrait" | "landscape";
    setOrientation: React.Dispatch<React.SetStateAction<"portrait" | "landscape">>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    numPerPage: 1 | 2 | 4;
    setNumPerPage: React.Dispatch<React.SetStateAction<2 | 1 | 4>>;
    margin: number;
    setMargin: React.Dispatch<React.SetStateAction<number>>;
    fontScale: number;
    setFontScale: React.Dispatch<React.SetStateAction<number>>;
}

const BingoContext = createContext<BingoState>(null as unknown as BingoState);

interface BingoStateProviderProps {
    children: React.ReactNode | Iterable<React.ReactNode>;
}

const empty: [] = [];
const emptyObject: {} = {};

const TERM_STORAGE_KEY = "TERMS";

type StoredTerms = {
    [termSetName: string]: string[];
};

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
    const [activeTermSet, setActiveTermSet] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [numPerPage, setNumPerPage] = useState<1 | 2 | 4>(1);
    const [name, setName] = useState<string>("");
    const [format, setFormat] = useState<PageFormats>(PageFormats.Let);
    const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
    const [margin, setMargin] = useState<number>(20);
    const [fontScale, setFontScale] = useState<number>(1);

    useEffect(() => {
        setTermSets(getTermSets());
        if (activeTermSet) {
            setTerms(getTerms(activeTermSet));
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

    const state = {
        terms,
        addTerm,
        removeTerm,
        clearTerms,
        errors,
        pushError,
        popError,
        clearErrors,
        bonus,
        setBonus,
        sideLength,
        setSideLength,
        key,
        regenerate,
        termSets,
        activeTermSet,
        setTermSet,
        writeTerms,
        containerRef,
        format,
        setFormat,
        orientation,
        setOrientation,
        name,
        setName,
        numPerPage,
        setNumPerPage,
        margin,
        setMargin,
        fontScale,
        setFontScale,
    };

    return <BingoContext.Provider value={state}>{children}</BingoContext.Provider>;
};

const nullCheck = (state: BingoState) => {
    if (!state) {
        throw new Error("BingoContext was null!");
    }
};

export const useKey = () => {
    const state = useContext(BingoContext);

    nullCheck(state);

    return state.key;
};

export const useTerms = () => {
    const state = useContext(BingoContext);

    nullCheck(state);

    return useMemo(() => Object.keys(state.terms), [state.terms]);
};

export const useFontScale = () => {
    const state = useContext(BingoContext);

    nullCheck(state);

    return state.fontScale;
};

export const useBingoViewState = () => {
    const state = useContext(BingoContext);

    nullCheck(state);

    return {
        bonus: state.bonus,
        sideLength: state.sideLength,
        containerRef: state.containerRef,
        format: state.format,
        orientation: state.orientation,
        name: state.name,
        numPerPage: state.numPerPage,
        margin: state.margin,
    };
};

export const useBingoState = () => {
    const state = useContext(BingoContext);

    nullCheck(state);

    return state;
};
