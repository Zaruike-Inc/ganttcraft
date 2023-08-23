export interface IFilterData {
    id: number,
    name: string,
    slug: string,
    totalProjectsCount?: number,
    selected: boolean
}

export interface IFilterOptionSelected extends Omit<IFilterData, 'selected'> {
    selected?: boolean
}

export type TCardTypeFilter = 'VISIBILITY' | 'TYPE';
