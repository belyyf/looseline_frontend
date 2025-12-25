import React from 'react';
import ReactDOM from 'react-dom/client';
import { AssistantWidget } from './AssistantWidget';

// Create a root element if it doesn't exist
const rootId = 'll-assistant-root';
let rootElement = document.getElementById(rootId);

if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = rootId;
    document.body.appendChild(rootElement);
}

// Mount the app
ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <AssistantWidget />
    </React.StrictMode>,
);
