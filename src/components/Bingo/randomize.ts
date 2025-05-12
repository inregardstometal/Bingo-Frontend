export const randomize = <T>(array: T[], length: number): T[] => {
    const _array = [...array];
    let allowRepeat = false;

    //Randomly choose an index of the array to operate on
    const pickIndex = (): number => {
        return Math.round(Math.random() * (_array.length - 1));
    };

    //choose a random element within the array, taking care to remove that element if repeats are disallowed
    const pick = (): T => {
        const index = pickIndex();

        const item = _array[index];

        if (!allowRepeat) {
            _array.splice(index, 1);
        }

        return item;
    };

    //check if we should allow repeats
    if (length > array.length) {
        allowRepeat = true;
    }

    const output: T[] = [];
    
    //assemble a new array of a given length from the elements of another array in a random order
    for (let i = 0; i < length; i++) {
        output.push(pick());
    }

    return output;
};
