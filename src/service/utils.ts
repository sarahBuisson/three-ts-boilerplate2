
export function shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5)
}

export function random<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}


export function removeFromArray<T>(array: T[], ...elements: T[]): T[] {
    return array.filter(item => !includes(elements,item));
}

function includes<T>(array: T[], item: T): boolean {
    return array.includes(item);
}
