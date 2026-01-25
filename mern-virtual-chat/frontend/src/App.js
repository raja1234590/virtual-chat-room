import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";
import SummaryPage from "./Pages/SummaryPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chats" element={<Chatpage />} />
        <Route path="/summary/:chatId" element={<SummaryPage />} />

      </Routes>
    </div>
  );
}

export default App;
