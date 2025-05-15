export const createDocument = <T extends HTMLElement>(
    elements: T[],
    withStyles: boolean = true
): HTMLHtmlElement => {
    //Create the main structural elements of an html document
    const html = document.createElement("html");
    const head = document.createElement("head");
    const body = document.createElement("body");
    let styles: Node[] = [];
    //Rip the styled from the current document and clone them (to prevent mutation)
    if (withStyles) {
        styles = Array.from(document.getElementsByTagName("style")).map((el) =>
            el.cloneNode(true)
        );
    }
    //Deep clone the document children to prevent mutation
    elements = elements.map((el) => el.cloneNode(true) as T);

    //Write both styles and children into their corresponding parents
    head.append(...styles);
    body.append(...elements);

    //Prevent scrollbar from appearing
    body.style.overflow = "visible";

    //Write head and body into HTML document
    html.appendChild(head);
    html.appendChild(body);

    return html;
};
