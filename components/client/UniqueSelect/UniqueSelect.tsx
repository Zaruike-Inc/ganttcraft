import React, {useContext} from "react";
import Select, {ActionMeta, components, OptionProps, SingleValue} from "react-select";
import ThemeContext from "../../../contexts/ThemeContext";

interface Props {
    /**
     * Default option
     */
    opts: { label: string, avatar?: string; value: string | number }[];
    isCustomOptions?: boolean;
    /**
     * Unique id is important !
     */
    id: string;
    /**
     * Message if not items
     */
    noOptionsMessage?: ((obj: { inputValue: string }) => React.ReactNode);
    onChange?: ((
        newValue: SingleValue<{ label: string, avatar?: string, value: string }>,
        actionMeta: ActionMeta<{ label: string, avatar?: string, value: string }>
    ) => void);
    value: SingleValue<{ label: string, avatar?: string, value: string } | undefined>;
    label?: string;
    avatar?: string;
    required?: boolean;
    error?: React.JSX.Element[] | React.JSX.Element | boolean;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
}

const UniqueSelect = (
    {
        clearable = false,
        placeholder = undefined,
        opts,
        isCustomOptions = false,
        noOptionsMessage,
        id,
        value,
        label,
        required = false,
        onChange,
        disabled = false,
        error
    }: Props
): React.JSX.Element => {
    const {isDark} = useContext(ThemeContext);
    const Option = (props: OptionProps<{ label: string, avatar?: string, value: string }>): JSX.Element => {
        const {data} = props;
        return (
            isCustomOptions ?
                <components.Option {...props}>
                    <div className={''}>
                        <div className={''}>

                        </div>
                        <span className={''}>{data.label}</span>
                    </div>
                </components.Option> :
                <components.Option {...props}>
                    {data.label}
                </components.Option>
        );
    }

    return <div className={''}>
        <label htmlFor={`${id}`}>
            {
                label !== undefined &&
                label !== null &&
                label.length > 0 &&
                label
            }
            {required && <span className={''}> *</span>}
            <Select
                isDisabled={disabled}
                isClearable={clearable}
                placeholder={placeholder}
                theme={(theme) => ({
                    ...theme,
                    colors: isDark ?
                        // thème sombre
                        {
                            ...theme.colors,
                            neutral0: '#2a3142',
                            primary25: '#606673',
                            neutral20: '#465675',
                            neutral30: '#0099cc',
                            primary: '#0099cc',
                            neutral80: '#FFF',
                            neutral10: '#353c4c',
                        } :
                        {
                            ...theme.colors
                        }
                })}
                noOptionsMessage={noOptionsMessage}
                id={id}
                value={value}
                components={{Option}}
                isMulti={false}
                onChange={onChange}
                options={opts as unknown as { label: string, avatar?: string; value: string }[]}
            />
            {error !== undefined && error !== null && error}
        </label>
    </div>
}

export default UniqueSelect;
