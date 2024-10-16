import io from "socket.io-client";
import UsersList from "./UsersList";
import "./App.css"

const socket = io.connect("http://localhost:8080");

function App() {
  return (
    <div className="App">
      <UsersList socket={socket}/>
    </div>
  );
}

export default App;
