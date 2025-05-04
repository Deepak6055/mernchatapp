import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import Querypage  from "./Pages/Querypage";
import Newspage from "./Pages/Newspage";
import BottomBar from "./components/Bottombar";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
      <Route path="/query" component={Querypage} />
      <Route path="/news" component={Newspage} />
      <BottomBar />
    </div>
  );
}

export default App;
