import { randomize } from "./randomize";

export const generateSheets = (
    referenceWrapper: HTMLDivElement,
    numberOfSheets: number,
    terms: string[],
    hasFreeSquare: boolean = true
): HTMLDivElement[] => {
    const elements: HTMLDivElement[] = [];

    if (referenceWrapper.getElementsByTagName("table").length === 0) {
        throw new Error("This referenceWrapper doesn't contain a <table/> elements");
    }

    for (let i = 0; i < numberOfSheets; i++) {
        const clone = referenceWrapper.cloneNode(true) as HTMLDivElement;

        const tables = clone.getElementsByTagName("table");

        for (let table of tables) {
            const cells = Array.from(table.getElementsByTagName("td"));

            const cellValues = randomize(terms, cells.length);

            const bonusIndex = Math.ceil((cells.length - 1) / 2);

            for (let [idx, cell] of cells.entries()) {
                if (hasFreeSquare && idx === bonusIndex) continue;
                const span = cell.firstChild as HTMLSpanElement | null;
                if (span) {
                    span.innerText = cellValues[idx];
                }
            }
        }

        elements.push(clone);
    }

    return elements;
};
