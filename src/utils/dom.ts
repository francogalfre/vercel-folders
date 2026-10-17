export function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: object = {},
    children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);

    return node;
}
