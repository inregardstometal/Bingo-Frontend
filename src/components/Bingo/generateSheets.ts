import { randomize } from "./randomize";

export const generateSheets = (
    referenceWrapper: HTMLDivElement,
    numberOfSheets: number,
    terms: string[],
    hasFreeSquare: boolean = true
): HTMLDivElement[] => {
    const elements: HTMLDivElement[] = [];

    //Make sure that the generated Bingo sheet contains at least one table
    if (referenceWrapper.getElementsByTagName("table").length === 0) {
        throw new Error("This referenceWrapper doesn't contain a <table/> element");
    }

    //For each sheet to be generated
    for (let i = 0; i < numberOfSheets; i++) {
        //Copy the source sheet to prevent mutation
        const clone = referenceWrapper.cloneNode(true) as HTMLDivElement;
        //Get the tables from the copied sheet (could be as many as four)
        const tables = clone.getElementsByTagName("table");

        //For each table
        for (let table of tables) {
            //Get the cells
            const cells = Array.from(table.getElementsByTagName("td"));

            //Generate a new random set of cells from the passed terms
            const cellValues = randomize(terms, cells.length);

            //Figure out the index of the bonus cell
            const bonusIndex = Math.ceil((cells.length - 1) / 2);

            //For each cell
            for (let [idx, cell] of cells.entries()) {
                //If this cell is the bonus cell, skip it
                if (hasFreeSquare && idx === bonusIndex) continue;
                //Otherwise, overwrite the content of the cell with the newly generated content
                const span = cell.firstChild as HTMLSpanElement | null;
                if (span) {
                    span.innerText = cellValues[idx] ?? "";
                }
            }
        }

        //Append the sheet to the list of sheets
        elements.push(clone);
    }

    return elements;
};
