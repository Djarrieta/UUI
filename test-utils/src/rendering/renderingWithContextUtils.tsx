import React, { ReactElement } from 'react';
import { render, renderHook } from '../extensions/testingLibraryReactExt';
import renderer from 'react-test-renderer';
import { ContextProvider, UuiContexts } from '@epam/uui-core';
import { delayAct } from './timerUtils';

export { renderer };

export type CustomWrapperType = ({ children }: { children?: React.ReactNode }) => JSX.Element;

/**
 * Creates a component which wraps given children with default UUI context provider.
 */
export const getDefaultUUiContextWrapper = () => {
    const testUuiCtx = {} as UuiContexts;
    const wrapper: CustomWrapperType = function UuiContextDefaultWrapper({ children }) {
        return (
            <ContextProvider onInitCompleted={ (svc) => { Object.assign(testUuiCtx, svc); } }>
                { children }
            </ContextProvider>
        );
    };
    return {
        wrapper,
        testUuiCtx,
    };
};

/**
 * Wraps the hook with context and renders it to the test environment.
 *
 * It internally uses "renderHook" method of "testing-library/react" library.
 *
 * @param hook
 * @param initialProps
 * @param [options]
 * @param [options.wrapper]
 */
export async function renderHookWithContextAsync<TProps, TResult>(hook: (props: TProps) => TResult, initialProps?: TProps, options?: { wrapper?: CustomWrapperType }) {
    const wrapper = options?.wrapper || getDefaultUUiContextWrapper().wrapper;
    const result = renderHook<TResult, TProps>(hook, { wrapper, initialProps });
    await delayAct();
    return {
        ...result,
    };
}

/**
 * Wraps the component with context and renders it as JSON using react-test-renderer.
 *
 * Returns virtual DOM structure.
 * Can be used to render React components to pure JavaScript objects.
 * It has no dependency on DOM.
 *
 * @param reactElement
 * @param [options]
 * @param [options.wrapper]
 */
export const renderSnapshotWithContextAsync = async (reactElement: ReactElement, options?: { wrapper?: CustomWrapperType }) => {
    const wrapper = options?.wrapper || getDefaultUUiContextWrapper().wrapper;
    const result = renderer.create(React.createElement(wrapper, { children: reactElement }));
    await delayAct();
    return result.toJSON();
};

/**
 * Wraps the component with context and renders it to the test environment.
 *
 * @param reactElement
 * @param [options]
 * @param [options.wrapper]
 */
export const renderWithContextAsync = async (reactElement: ReactElement, options?: { wrapper?: CustomWrapperType }) => {
    const wrapper = options?.wrapper || getDefaultUUiContextWrapper().wrapper;
    const result = render(reactElement, { wrapper });
    await delayAct();
    return {
        ...result,
    };
};
