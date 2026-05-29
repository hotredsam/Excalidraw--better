/** Small functional collection helpers (pure, dependency-free). */
export function sortBy(items, key, dir = 'asc') {
    const sign = dir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
        const ka = key(a);
        const kb = key(b);
        if (ka < kb)
            return -1 * sign;
        if (ka > kb)
            return 1 * sign;
        return 0;
    });
}
export function partition(items, pred) {
    const yes = [];
    const no = [];
    for (const item of items)
        (pred(item) ? yes : no).push(item);
    return [yes, no];
}
export function chunk(items, size) {
    if (size <= 0)
        return [items];
    const out = [];
    for (let i = 0; i < items.length; i += size)
        out.push(items.slice(i, i + size));
    return out;
}
export function range(start, end, step = 1) {
    const [from, to] = end === undefined ? [0, start] : [start, end];
    const out = [];
    if (step === 0)
        return out;
    if (step > 0)
        for (let i = from; i < to; i += step)
            out.push(i);
    else
        for (let i = from; i > to; i += step)
            out.push(i);
    return out;
}
export function sum(items) {
    return items.reduce((a, b) => a + b, 0);
}
export function average(items) {
    return items.length === 0 ? 0 : sum(items) / items.length;
}
export function first(items) {
    return items[0];
}
export function last(items) {
    return items[items.length - 1];
}
export function compact(items) {
    return items.filter(Boolean);
}
export function keyBy(items, key) {
    const out = {};
    for (const item of items)
        out[key(item)] = item;
    return out;
}
export function move(items, from, to) {
    const out = [...items];
    if (from < 0 || from >= out.length || to < 0 || to >= out.length)
        return out;
    const [item] = out.splice(from, 1);
    out.splice(to, 0, item);
    return out;
}
