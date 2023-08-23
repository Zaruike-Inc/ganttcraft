import {useEffect} from "react";

/**
 * hook for close a menu or any other item out of current target
 * @param {HTMLElement|undefined} ref Current ref of your element
 * @param {boolean} val - Prevent memory leak and rerender action infinite with the boolean
 * @param {Function} onClickOut Handle action when clickOut
 * @param {unknown[]} deps deps of your useEffect
 */
export function useOutsideClick(
    ref: HTMLElement | undefined,
    val: boolean,
    onClickOut: () => void,
    deps: unknown[] = []
) {
    useEffect(() => {
        const onClick = ({target}: MouseEvent) => {
            if (ref !== undefined && ref !== null && !ref?.contains(target as unknown as Element) && val) {
                onClickOut?.();
                // remove event after click for prevent any rerender :)
                document.removeEventListener('click', onClick)
            }
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, deps)
}
