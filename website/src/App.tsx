import React from 'react';
import ChatUI from "./components/ChatUI.tsx";

const App: React.FC = () => {

    return (
        <div
            style={{ height: "100vh", width: "100vw"}}>
            <ChatUI />
        </div>
    );
};

export default App;
