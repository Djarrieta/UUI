import React, {
    useCallback, useState, useEffect, useMemo,
} from 'react';
import dayjs from 'dayjs';
import cx from 'classnames';
import {
    DropdownBodyProps,
    TableFiltersConfig,
    IDropdownToggler,
    IEditable,
    isMobile,
    useForceUpdate,
    FilterPredicateName,
    getSeparatedValue,
    DataRowProps,
    PickerFilterConfig,
} from '@epam/uui-core';
import { Dropdown } from '@epam/uui-components';
import { i18n } from '../../i18n';
import { FilterPanelItemToggler } from './FilterPanelItemToggler';
import { Panel } from '../layout';
import { LinkButton } from '../buttons';
import { MultiSwitch } from '../inputs';
import { Text, TextPlaceholder } from '../typography';
import { FilterItemBody } from './FilterItemBody';
import { DropdownContainer } from '../overlays';
import { ReactComponent as RemoveIcon } from '@epam/assets/icons/common/action-deleteforever-12.svg';
import css from './FiltersPanelItem.module.scss';
import { MobileDropdownWrapper } from '../pickers';
import { Modifier } from 'react-popper';

export type FiltersToolbarItemProps = TableFiltersConfig<any> &
IEditable<any> & {
    autoFocus?: boolean;
    removeFilter?: (field: any) => void;
    size?: '24' | '30' | '36' | '42' | '48';
};

function FiltersToolbarItemImpl(props: FiltersToolbarItemProps) {
    const isPickersType = props?.type === 'multiPicker' || props?.type === 'singlePicker';
    const isMobileScreen = isMobile();

    const popperModifiers: Modifier<any>[] = useMemo(() => {
        const modifiers: Modifier<any>[] = [
            {
                name: 'offset',
                options: { offset: isPickersType && isMobileScreen ? [0, 0] : [0, 6] },
            },
        ];

        if (isPickersType && isMobileScreen) {
            modifiers.push({
                name: 'resetTransform',
                enabled: true,
                phase: 'beforeWrite',
                requires: ['computeStyles'],
                fn: ({ state }) => {
                    state.styles.popper.transform = '';
                },
            });
        }

        return modifiers;
    }, [isPickersType]);

    const getDefaultPredicate = () => {
        if (!props.predicates) {
            return null;
        }
        return Object.keys(props.value || {})[0] || props.predicates.find((i) => i.isDefault)?.predicate || props.predicates?.[0].predicate;
    };

    const [isOpen, isOpenChange] = useState(props.autoFocus);
    const [predicate, setPredicate] = useState(getDefaultPredicate());
    const predicateName: string = React.useMemo(() => predicate && props.predicates.find((p) => p.predicate === predicate).name, [predicate]);
    const forceUpdate = useForceUpdate();

    useEffect(() => {
        if (props.predicates && Object.keys(props.value || {})[0] && Object.keys(props.value || {})[0] !== predicate) {
            setPredicate(Object.keys(props.value || {})[0]);
        }
    }, [props.value]);

    const onValueChange = useCallback(
        (value: any) => {
            if (props.predicates) {
                props.onValueChange({ [props.field]: { [predicate]: value } });
            } else {
                props.onValueChange({ [props.field]: value });
            }
        },
        [props.field, props.onValueChange],
    );

    const removeOnclickHandler = () => {
        props.removeFilter(props.field);
    };

    const changePredicate = (val: FilterPredicateName) => {
        const isInRange = (p: FilterPredicateName) => p === 'inRange' || p === 'notInRange';
        if (props.type === 'numeric') {
            let predicateValue = {
                [props.field]: { [val]: getValue() },
            };
            if (isInRange(val) && !isInRange(predicate as FilterPredicateName)) {
                // from simple predicate -> to Range
                predicateValue = { [props.field]: { [val]: { from: null, to: null } } };
            } else if (!isInRange(val) && isInRange(predicate as FilterPredicateName)) {
                // from Range -> to simple predicate
                predicateValue = { [props.field]: { [val]: null } };
            }
            props.onValueChange(predicateValue);
        } else {
            props.onValueChange({ [props.field]: { [val]: getValue() } });
        }
        setPredicate(val);
    };

    const renderHeader = (hideTitle: boolean) => (
        <div className={ cx(css.header, isPickersType && (props.showSearch ?? css.withSearch)) }>
            {props.predicates ? (
                <MultiSwitch items={ props.predicates.map((i) => ({ id: i.predicate, caption: i.name })) } value={ predicate } onValueChange={ changePredicate } size="24" />
            ) : (
                !hideTitle && (
                    <Text color="secondary" size="24" fontSize="14">
                        {props.title}
                    </Text>
                )
            )}
            {!props?.isAlwaysVisible && (
                <LinkButton cx={ css.removeButton } caption={ i18n.filterToolbar.datePicker.removeCaption } onClick={ removeOnclickHandler } size="24" icon={ RemoveIcon } />
            )}
        </div>
    );

    const renderBody = (dropdownProps: DropdownBodyProps) => {
        const hideHeaderTitle = isPickersType && isMobileScreen;
        return (
            <DropdownContainer { ...dropdownProps }>
                <Panel cx={ css.panel }>
                    { isPickersType ? (
                        <MobileDropdownWrapper title={ props.title } close={ () => isOpenChange(false) }>
                            { renderHeader(hideHeaderTitle) }
                            <FilterItemBody
                                { ...props }
                                { ...dropdownProps }
                                selectedPredicate={ predicate }
                                value={ getValue() }
                                onValueChange={ onValueChange }
                            />
                        </MobileDropdownWrapper>
                    ) : (
                        <>
                            { renderHeader(hideHeaderTitle) }
                            <FilterItemBody
                                { ...props }
                                { ...dropdownProps }
                                selectedPredicate={ predicate }
                                value={ getValue() }
                                onValueChange={ onValueChange }
                            />
                        </>
                    ) }
                </Panel>
            </DropdownContainer>
        );
    };

    const getValue = () => {
        return predicate ? props.value?.[predicate] : props.value;
    };

    const getPickerItemName = (item: DataRowProps<any, any>, config: PickerFilterConfig<any>) => {
        if (item.isUnknown) {
            return 'Unknown';
        }

        if (item.isLoading) {
            return <TextPlaceholder />;
        }

        return config.getName ? config.getName(item.value) : item.value.name;
    };

    const getTogglerValue = () => {
        const currentValue = getValue();
        const defaultFormat = 'MMM DD, YYYY';

        switch (props.type) {
            case 'multiPicker': {
                const view = props.dataSource.getView({}, forceUpdate);
                const postfix = currentValue?.length > 2 ? ` +${(currentValue.length - 2).toString()} ${i18n.filterToolbar.pickerInput.itemsPlaceholder}` : null;
                let isLoading = false;

                const selection = currentValue
                    ? currentValue?.slice(0, 2).map((i: any) => {
                        const item = view.getById(i, null);
                        isLoading = item.isLoading;
                        return getPickerItemName(item, props);
                    })
                    : [currentValue];

                const selectionText = isLoading ? selection : selection.join(', ');
                return { selection: selectionText, postfix };
            }
            case 'numeric': {
                const isRangePredicate = predicate === 'inRange' || predicate === 'notInRange';
                const decimalFormat = (val: number) => getSeparatedValue(val, { maximumFractionDigits: 2 });
                if ((isRangePredicate && !currentValue) || (!isRangePredicate && !currentValue && currentValue !== 0)) {
                    return { selection: currentValue };
                }
                const selection = isRangePredicate
                    ? `${!currentValue?.from && currentValue?.from !== 0 ? 'Min' : decimalFormat(currentValue?.from)} - ${
                        !currentValue?.to && currentValue?.to !== 0 ? 'Max' : decimalFormat(currentValue?.to)
                    }`
                    : `${!currentValue && currentValue !== 0 ? 'ALL' : decimalFormat(currentValue)}`;
                return { selection };
            }
            case 'singlePicker': {
                const view = props.dataSource.getView({}, forceUpdate);
                if (currentValue === null || currentValue === undefined) {
                    return { selection: currentValue };
                }

                const item = view.getById(currentValue, null);
                const selection = getPickerItemName(item, props);

                return { selection };
            }
            case 'datePicker': {
                return { selection: currentValue ? dayjs(currentValue).format(props.format || defaultFormat) : i18n.filterToolbar.datePicker.placeholder };
            }
            case 'rangeDatePicker': {
                if (!currentValue || (!currentValue.from && !currentValue.to)) {
                    return { selection: i18n.filterToolbar.rangeDatePicker.emptyPickerPlaceholder };
                }
                const currentValueFrom = currentValue?.from
                    ? dayjs(currentValue?.from).format(props.format || defaultFormat)
                    : i18n.filterToolbar.rangeDatePicker.emptyPlaceholderFrom;
                const currentValueTo = currentValue?.to
                    ? dayjs(currentValue?.to).format(props.format || defaultFormat)
                    : i18n.filterToolbar.rangeDatePicker.emptyPlaceholderTo;
                const selection = `${currentValueFrom} - ${currentValueTo}`;
                return { selection };
            }
        }
    };

    const renderTarget = (dropdownProps: IDropdownToggler) => (
        <FilterPanelItemToggler
            { ...dropdownProps }
            { ...getTogglerValue() }
            title={ props.title }
            predicateName={ props.value ? predicateName : null }
            maxWidth={ props.type === 'datePicker' || props.type === 'rangeDatePicker' ? null : '300' }
            size={ props.size }
        />
    );

    return (
        <Dropdown
            renderTarget={ renderTarget }
            renderBody={ renderBody }
            closeBodyOnTogglerHidden={ !isMobile() }
            value={ isOpen }
            onValueChange={ isOpenChange }
            modifiers={ popperModifiers }
        />
    );
}

export const FiltersPanelItem = React.memo(FiltersToolbarItemImpl);
