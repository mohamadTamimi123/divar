'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

    // Load saved selections from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCity = localStorage.getItem('selectedCity');
            const savedNeighborhoods = localStorage.getItem('selectedNeighborhoods');
            
            if (savedCity) {
                setSelectedCity(savedCity);
            }
            if (savedNeighborhoods) {
                try {
                    const parsed = JSON.parse(savedNeighborhoods);
                    setSelectedNeighborhoods(Array.isArray(parsed) ? parsed : []);
                } catch (e) {
                    setSelectedNeighborhoods([]);
                }
            }
        }
    }, []);

    // Save selections to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (selectedCity) {
                localStorage.setItem('selectedCity', selectedCity);
            } else {
                localStorage.removeItem('selectedCity');
            }
        }
    }, [selectedCity]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (selectedNeighborhoods.length > 0) {
                localStorage.setItem('selectedNeighborhoods', JSON.stringify(selectedNeighborhoods));
            } else {
                localStorage.removeItem('selectedNeighborhoods');
            }
        }
    }, [selectedNeighborhoods]);

    const clearFilters = () => {
        setSelectedCity('');
        setSelectedNeighborhoods([]);
        // Also clear from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('selectedCity');
            localStorage.removeItem('selectedNeighborhoods');
        }
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