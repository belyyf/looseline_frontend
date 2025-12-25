import React, { useState } from 'react';
import AssistantWindow from './assistant';
import './assistant.css';

export const AssistantWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="assistant-wrapper">
            <AssistantWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <button
                className={`assistant-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={toggleOpen}
            >
                {isOpen ? '✕' : '🤖'}
            </button>
        </div>
    );
};
