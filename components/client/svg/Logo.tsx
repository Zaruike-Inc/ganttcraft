import React from "react";

interface Props {
    width: number,
    height: number,
    fillColor?: string
}

const Logo = ({width,height, fillColor = 'black'}: Props): React.JSX.Element => {
    return <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        height={height}
        width={width}
        viewBox="0 0 15 15"
        enableBackground={'new 0 0 15 15'}
        xmlnsXlink={"http://www.w3.org/1999/xlink"}
        xmlSpace={'preserve'}
    >
        <path
            fill={fillColor}
            fillRule={"evenodd"}
            clipRule={"evenodd"}
            className="st0"
            d="M0,0h1v14h14v1H0V0z M2,2h3.5v1H2V2z M3,5h5.7v1H3V5z M6.2,8h5.3v1H6.2V8z M8,11h7v1H8V11z"/>
    </svg>
}

export default Logo;
