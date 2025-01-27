import React from 'react';
import ChatBlock from "./components/ChatBlock.tsx";

const App: React.FC = () => {

    return (
        <div
            style={{ height: "100vh", width: "100vw"}}>
            <ChatBlock />
        </div>
    );
};

export default App;
