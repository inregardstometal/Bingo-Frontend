export const createDocument = <T extends HTMLElement>(
    els: T[],
    withStyles: boolean = true
): HTMLHtmlElement => {
    const html = document.createElement("html");
    const head = document.createElement("head");
    const body = document.createElement("body");
    let styles: Node[] = [];
    if (withStyles) {
        styles = Array.from(document.getElementsByTagName("style")).map((el) =>
            el.cloneNode(true)
        );
    }
    els = els.map((el) => el.cloneNode(true) as T);

    head.append(...styles);
    body.append(...els);

    body.style.overflow = "visible";

    html.appendChild(head);
    html.appendChild(body);

    return html;
};
