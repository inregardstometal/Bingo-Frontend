import html2canvas from "html2canvas";

export const augment = () => {
    (window as Window & typeof globalThis & { html2canvas: typeof html2canvas }).html2canvas =
        html2canvas;
};
