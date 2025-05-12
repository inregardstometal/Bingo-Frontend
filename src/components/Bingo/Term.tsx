import { Typography, TypographyProps } from "@mui/material";

const separate = (str: string, filter: string): React.JSX.Element[] => {
    const output: React.JSX.Element[] = [];

    let matched = "";
    let lastMatchedIndex = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        //if match is complete, push matched portion. If this isn't the beginning of the string, also push the unmatched portion of the string before pushing the matched portion
        if (matched.length === filter.length) {
            if (lastMatchedIndex !== i - matched.length) {
                output.push(
                    <span>{str.substring(lastMatchedIndex, i - matched.length)}</span>
                );
            }
            output.push(
                <span>
                    <b>{matched}</b>
                </span>
            );
            matched = "";
            lastMatchedIndex = i;
        } else if (char === filter[matched.length]) {
            matched += char;
        }
    }

    return output;
};

interface TermProps {
    children?: string;
    filter?: string;
    typographyProps?: TypographyProps;
}

export const Term = ({ children, filter, typographyProps }: TermProps): React.JSX.Element => {
    if (!filter) {
        return <Typography {...typographyProps}>{children}</Typography>;
    } else {
        const sequence = separate(children ?? "", filter);
        return <Typography {...typographyProps}>{sequence}</Typography>;
    }
};
