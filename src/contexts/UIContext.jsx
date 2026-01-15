import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [modals, setModals] = useState({
    settings: false,
    rules: false,
    saveLoad: false,
    dungeonFeatures: false,
    campaign: false,
    equipment: false,
    abilities: false
  });

  const openModal = (name) => {
    setModals(prev => ({ ...prev, [name]: true }));
  };

  const closeModal = (name) => {
    setModals(prev => ({ ...prev, [name]: false }));
  };

  const toggleModal = (name) => {
    setModals(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const value = {
    modals,
    openModal,
    closeModal,
    toggleModal
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
