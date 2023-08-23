type TIsNullContent = string | string[] | object | unknown | unknown[];

export function isNull(props?: TIsNullContent): boolean {
    if (props === undefined || props === null || typeof props === "undefined") {
        return true;
    }
    // Check if the props is a date and isnt a number
    else if (props instanceof Date && !isNaN(props as unknown as number)) {
        return false;
    } else if (typeof props === "string") {
        return props.trim().length === 0;
    } else if (typeof props === "object") {
        return Object.keys(props).length === 0;
    } else if (Array.isArray(props)) {
        return (props as string[]).length === 0;
    } else {
        return false;
    }
}

export const isNotNull = (props?: string | string[] | unknown | unknown[]): boolean => {
    return !isNull(props);
}
