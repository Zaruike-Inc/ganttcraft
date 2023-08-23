import React, {useContext} from "react";
import ThemeContext from "../../../contexts/ThemeContext";
import Select, {ActionMeta, components, MultiValue, OptionProps} from "react-select";
import CreatableSelect from "react-select/creatable";
import JdentIconSVG from "#/client/JdentIconSVG/JdentIconSVG";

interface Props {
    /**
     * Options que l'on envoie par défaut
     */
    opts: {
        label: string,
        value: string
    }[];
    isCustomOptions?: boolean;
    /**
     * Identifiant unique
     */
    id: string;
    /**
     * Si on souhaite définir un message pour lorsqu'il n'y a aucun résultat
     */
    noOptionsMessage?: ((obj: {
        inputValue: string
    }) => React.ReactNode);
    onChange?: ((
        newValue: MultiValue<{
            label: string,
            avatar?: string,
            value: string,
            project?: {
                name: string,
                nameWithNameSpace: string
                pathWithNameSpace: string
            }
        }>,
        actionMeta: ActionMeta<{
            label: string,
            avatar?: string,
            value: string,
            project?: {
                name: string,
                nameWithNameSpace: string
                pathWithNameSpace: string
            }
        }>
    ) => void);
    value: MultiValue<{
        label: string,
        avatar?: string,
        value: string
    }>;
    label?: string;
    required?: boolean;
    error?: React.JSX.Element[] | React.JSX.Element | boolean;
    /**
     * Si on souhaite supprimer le padding
     */
    removePadding?: boolean;
    /**
     * Placeholder de notre multipleSelect
     */
    placeholder?: string;
    /**
     * Si on souhaite créer des elements via l'input
     * @return {boolean|undefined}
     */
    creatable?: boolean;
}

/**
 * Customise les options que l'on veut à la vue
 * @param {OptionProps} props - Props courante
 * @param {boolean} isCustomOptions
 * @constructor
 */
const Option = (props: OptionProps<{
    label: string,
    project?: {
        name: string,
        nameWithNameSpace: string,
        pathWithNameSpace: string
    };
    value: string
}>, isCustomOptions: boolean = true): React.JSX.Element => {
    const {data} = props;
    return (
        isCustomOptions ?
            <components.Option {...props}>
                <div className="flex w-full items-center gap-4">
                    <div
                        className={'flex w-6 h-6 items-center justify-center overflow-hidden text-center' +
                            ' transition-all duration-300 rounded-full'
                        }>
                        <JdentIconSVG
                            size={35}
                            className={'max-h-full max-w-full object-cover shadow-sm dark:border-transparent h-10 w-10'}
                            value={`${data.project?.pathWithNameSpace}`}/>
                    </div>
                    <div>
                        <h3
                            className={
                                'font-heading text-sm font-medium leading-normal text-neutral-700 dark:text-neutral-100'
                            }>{data.label}</h3>
                        <p
                            className={
                                'text-neutral-500 dark:text-neutral-300 font-sans text-xs font-normal leading-normal' +
                                ' text-muted-400'
                            }>{data.project?.nameWithNameSpace}</p>
                    </div>
                </div>
            </components.Option> :
            <components.Option {...props}>
                {data.label}
            </components.Option>
    );
}
const MultipleSelect = (
    {
        creatable = false,
        placeholder = undefined,
        opts,
        noOptionsMessage,
        id,
        value = [],
        onChange,
        required = false,
        error,
        label
    }: Props
): React.JSX.Element => {
    const {isDark} = useContext(ThemeContext);

    return <div className={''}>
        <label htmlFor={`${id}`}>
            {label !== undefined && label !== null && label.length > 0 && label}
            {required && <span className={''}> *</span>}
            {creatable ? <CreatableSelect
                placeholder={placeholder}
                theme={(theme) => ({
                    ...theme,
                    colors: isDark ?
                        {
                            ...theme.colors,
                            neutral0: '#404040',
                            primary25: '#8d8d8d',
                            neutral20: '#525252',
                            neutral30: '#0099cc',
                            primary: '#0099cc',
                            neutral80: '#FFF',
                            neutral10: '#262626',
                        } :
                        {...theme.colors}
                })}
                noOptionsMessage={noOptionsMessage}
                id={id}
                value={value}
                components={{Option}}
                isMulti={true}
                onChange={onChange}
                options={opts}
            /> : <Select
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
                        {...theme.colors}
                })}
                noOptionsMessage={noOptionsMessage}
                id={id}
                value={value}
                components={{Option}}
                isMulti={true}
                onChange={onChange}
                options={opts}
            />}
            {error !== undefined && error !== null && error}
        </label>
    </div>
}
export default MultipleSelect;
