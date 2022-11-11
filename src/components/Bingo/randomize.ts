export const randomize = <T>(array: T[], length: number): T[] => {
    const _array = [...array];
    let allowRepeat = false;

    const pickIndex = (): number => {
        return Math.round(Math.random() * (_array.length - 1));
    };

    const pick = (): T => {
        const index = pickIndex();

        const item = _array[index];

        if (!allowRepeat) {
            _array.splice(index, 1);
        }

        return item;
    };

    if (length > array.length) {
        allowRepeat = true;
    }

    const output: T[] = [];

    for (let i = 0; i < length; i++) {
        output.push(pick());
    }

    return output;
};
