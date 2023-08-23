import React, {useContext} from "react";
import Style from './Checkbox.module.css';
import themeContext from "../../../contexts/ThemeContext";

interface Props {
    id: string,
    label: string;
    checked: boolean,
    handleCheck(val: boolean): void;
}

const Checkbox = ({id, label, checked, handleCheck}: Props): React.JSX.Element => {
    const {isDark} = useContext(themeContext);
    return <label htmlFor={id} className={Style.inputCheckbox}>
        <input type="checkbox" id={id} checked={checked} onChange={() => handleCheck(!checked)} />
        <div className={`dark:bg-neutral-600 ${isDark ? Style.isDark: ''}`}>
            <svg className={`${Style.inputCheck} dark:text-neutral-100`} viewBox="-2 -2 35 35" aria-hidden="true">
                <title>checkmark-circle</title>
                <polyline points="7.57 15.87 12.62 21.07 23.43 9.93" />
            </svg>
        </div>
        <div className={'dark:text-neutral-100 text-sm'}>{label}</div>
    </label>
}

export default Checkbox;
