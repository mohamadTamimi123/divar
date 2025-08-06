'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

interface FiltersContextType {
    selectedCity: string;
    selectedNeighborhoods: string[];
    setSelectedCity: (city: string) => void;
    setSelectedNeighborhoods: (neighborhoods: string[]) => void;
    clearFilters: () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);

    const clearFilters = () => {
        setSelectedCity('');
        setSelectedNeighborhoods([]);
    };

    return (
        <FiltersContext.Provider value={{
            selectedCity,
            selectedNeighborhoods,
            setSelectedCity,
            setSelectedNeighborhoods,
            clearFilters
        }}>
            {children}
        </FiltersContext.Provider>
    );
}

export function useFilters(): FiltersContextType {
    const context = useContext(FiltersContext);
    if (context === undefined) {
        // Return default context instead of throwing error
        return {
            selectedCity: '',
            selectedNeighborhoods: [],
            setSelectedCity: () => {},
            setSelectedNeighborhoods: () => {},
            clearFilters: () => {}
        };
    }
    return context;
} 