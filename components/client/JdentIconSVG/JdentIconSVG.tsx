import React, {LegacyRef, useEffect, useRef} from "react";
import {updateSvg} from "jdenticon/standalone";

interface Props {
    size: number,
    className: string,
    value: string
}

const JdentIconSVG = ({value, size, className}: Props): React.JSX.Element => {
    const icon = useRef<SVGElement>(null);

    useEffect(() => {
        if (icon.current !== undefined && icon.current !== null) {
            updateSvg(icon.current, value)
        }
    }, [icon]);
    return <svg className={className} ref={icon as LegacyRef<SVGSVGElement> | undefined} width={size} height={size}/>
}

export default JdentIconSVG;
