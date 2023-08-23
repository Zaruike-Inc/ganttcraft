'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {IGitlabUser} from "#types/gateway/IGitlabGateway";
import FilterContent from "#/client/FilterContent/FilterContent";
import {IProject} from "#types/gateway/ITransformer";
import ResultItems from "#/client/ResultItems/ResultItems";
import {useAppDispatch} from "../../hook/hooks";
import {authenticateUser} from "../../store/reducer/userReducer";
import clientProvider from "#utils/ClientProvider";
import {IFilterData, TCardTypeFilter} from "#types/components/shared/CardFilter";
import {fetchProjects} from "../../store/reducer/projectsReducer";
import {TTypeSelected} from "#types/components/shared/TTypeSelected";

interface Props {
    data: { valid: boolean, user?: IGitlabUser }
}


const HomePageClient = ({data}: Props): React.JSX.Element => {
    // only pick here for prevent any rerender after
    const [currentSelected, setCurrentSelected] = useState<TTypeSelected>('ALL');
    const [allTypes, setAllTypes] = useState<IFilterData[]>([{
        name: 'Group',
        slug: 'group',
        id: 0,
        selected: false
    }, {
        name: 'Projects',
        slug: 'projects',
        id: 1,
        selected: true
    }]);

    const [allVisibility, setAllVisibility] = useState<IFilterData[]>([{
        name: 'Public',
        slug: 'public',
        id: 0,
        selected: true
    }, {
        name: 'Internal',
        slug: 'internal',
        id: 1,
        selected: true
    }, {
        name: 'Private',
        slug: 'private',
        id: 2,
        selected: true
    }])
    const [currentFiltersSearch, setCurrentFilterSearch] = useState<{
        typeSearch: string[],
        query: string,
    }>({
        typeSearch: ['projects'],
        query: ''
    })
    const dispatch = useAppDispatch();
    const Router = useRouter();

    const handleSelectedUnselectItem = (type: TCardTypeFilter, item: IFilterData, val: boolean): void => {
        if (type === "TYPE") {
            const cloneCurrentFilterSearch = {...currentFiltersSearch};
            setAllTypes([...allTypes].map((e) => {
                if (e.id === item.id) {
                    return {...e, selected: val}
                } else {
                    return e;
                }
            }))
            if (val) {
                cloneCurrentFilterSearch.typeSearch.push(item.slug);
            } else {
                cloneCurrentFilterSearch.typeSearch = cloneCurrentFilterSearch.typeSearch
                    .filter((e) => e !== item.slug);
            }
            setCurrentFilterSearch(cloneCurrentFilterSearch);
        } else {
            setAllVisibility([...allVisibility].map((e) => {
                if (e.id === item.id) {
                    return {...e, selected: val}
                } else {
                    return e;
                }
            }))
        }
    }

    useEffect(() => {
        console.log(data)
        if (data.valid && data.user !== undefined) {
            // authenticate the user
            dispatch(authenticateUser(data.user));
        } else {
            // if user isn't connected or session is expired for to reconnect
            Router.push('/login');
        }
    }, [data]);

    useEffect(() => {
        // Don't search if no type selected
        const makeSearchToServer = async () => {
            if (
                currentFiltersSearch !== undefined &&
                currentFiltersSearch.typeSearch.length > 0 &&
                data.valid &&
                data.user !== undefined) {
                clientProvider<{
                    projects: IProject[]
                    status: number,
                    code: number
                }>(`${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}/api/v1/search`, {
                    headers: {Authorization: `Bearer ${data.user.token}`},
                    body: {
                        typeSearch: JSON.stringify(currentFiltersSearch.typeSearch),
                        query: encodeURI(currentFiltersSearch.query)
                    }
                }, 'POST', true).then((rep) => {
                    if (rep.parseBody !== undefined && rep.status === 200 && rep.parseBody.projects !== undefined) {
                        const projectResult = rep.parseBody.projects;
                        // Sort project and group by alphabetical cause is need if you want search faster
                        if (projectResult.length > 0) {
                            projectResult.sort(function (a, b) {
                                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                                    return -1;
                                }
                                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                                    return 1;
                                }
                                return 0;
                            });
                        }
                        dispatch(fetchProjects({projects: projectResult}));

                    } else {
                        // emit error here
                    }
                }).catch((e) => {
                    // Emit error here
                    console.log(e)
                });
            }else{
                dispatch(fetchProjects({projects: []}));
            }
        }

        const handleInternalSearch = setTimeout(() => {
            // don't render this with sync content (no await)
            makeSearchToServer()
        }, 500);
        return () => clearTimeout(handleInternalSearch)

    }, [currentFiltersSearch, data]);
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e?.currentTarget?.value?.trim().length > 0) {
            setCurrentFilterSearch({...currentFiltersSearch, query: e.currentTarget.value});
        } else {
            setCurrentFilterSearch({...currentFiltersSearch, query: ''});
        }
    }

    return <div className={'mx-auto max-w-7xl'}>
        <div className="mx-auto mt-6 flex w-full items-center justify-center pb-4">
            <div className="relative w-full max-w-md">
                <input
                    value={currentFiltersSearch.query}
                    onChange={handleSearch}
                    className={'appearance-none block w-full bg-white dark:border-neutral-700 dark:bg-neutral-800' +
                        ' dark:text-neutral-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3' +
                        ' leading-tight focus:outline-none focus:bg-white focus:border-gray-500' +
                        ' dark:focus:border-neutral-500'}
                    type="text"
                    placeholder="Search ..."
                />
            </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-4">
                <FilterContent
                    allVisibility={allVisibility}
                    itemsType={allTypes}
                    handleSelectedUnselectItem={handleSelectedUnselectItem}
                />
            </div>
            <div className="col-span-12 sm:col-span-8">
                <ResultItems
                    isProjectDisabled={!allTypes.filter((e) => e.slug === 'projects')[0].selected}
                    isGroupDisabled={!allTypes.filter((e) => e.slug === 'group')[0].selected}
                    currentSelected={currentSelected}
                    setCurrentSelected={setCurrentSelected}
                    allVisibility={allVisibility.filter((e) => e.selected).map((e) => e.slug)}
                />
            </div>
        </div>
    </div>
}

export default HomePageClient;
