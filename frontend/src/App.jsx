import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
