import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import accessReducer from '../../redux/slices/accessSlice';

export function buildTestStore(preloadedState) {
    const config = { reducer: { access: accessReducer } };
    if (preloadedState) config.preloadedState = preloadedState;
    return configureStore(config);
}

export function renderWithProviders(ui, { store = buildTestStore(), route = '/' } = {}) {
    function Wrapper({ children }) {
        return (
            <Provider store={store}>
                <MemoryRouter initialEntries={[route]}>
                    {children}
                </MemoryRouter>
            </Provider>
        );
    }
    return { store, ...render(ui, { wrapper: Wrapper }) };
}
