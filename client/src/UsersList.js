import React, { useCallback, useEffect, useState } from "react";

const UsersList = ({ socket }) => {
  const [username, setUsername] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // The user to send messages to
  const [message, setMessage] = useState(""); // Message to send
  const [messages, setMessages] = useState([]); // Array of received messages

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, socketId: socket.id }),
      });

      console.log("Socket id", socket.id);
      const data = await response.json();
      setLoggedInUser(data.user);

      socket.emit("newUserRegistered");

      // Fetch users excluding the logged-in user
      // fetchUsers();
    } catch (err) {
      console.error("Error during registration:", err);
    }
  };

  const fetchUsers = async () => {
    const response = await fetch(
      `http://localhost:8080/api/users?username=${username}`
    );
    const users = await response.json();
    setUsers(users);
  };

  // Send message to the selected user
  const sendMessage = () => {
    console.log("selected User", selectedUser);
    if (selectedUser && message) {
      socket.emit("sendMessage", {
        toUserName: selectedUser.name,
        message,
        fromUserName: username,
      });
      setMessages((prev) => [
        ...prev,
        { from: username, message, to: selectedUser.name },
      ]);
      setMessage(""); // Clear input after sending
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/messages?fromUserName=${username}&toUserName=${selectedUser.name}`
      );
      const responseMessages = await res.json();
      console.log(responseMessages);
      setMessages(responseMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Listen for incoming messages
  /* useEffect(() => {
    socket.on("receiveMessage", ({ message, fromUserName, toUserName }) => {
      console.log("Message received", socket.id, message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { from: fromUserName, message, to: toUserName },
      ]);
    });

    console.log("UserName", username);

    socket.on("newConnected", (data) => {
      console.log("New Connected", data);
      fetchUsers(); // Fetch users when a new user connects
    });

    return () => {
      socket.removeListener("receiveMessage");
      socket.removeListener("newConnected");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("receiveMessage", ({ message, fromUserName, toUserName }) => {
      console.log("Message received", socket.id, message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { from: fromUserName, message, to: toUserName },
      ]);
    });

    if (selectedUser && username) {
      fetchMessages();
    }

    return () => {
      socket.removeListener("receiveMessage");
    };
  }, [username, selectedUser]); */

  useEffect(() => {
    const handleReceiveMessage = ({ message, fromUserName, toUserName }) => {
      console.log("Message received", socket.id, message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { from: fromUserName, message, to: toUserName },
      ]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    // Clean up event listeners when component unmounts or when dependencies change
    return () => {
      socket.removeListener("receiveMessage", handleReceiveMessage);
    };
  }, [username, selectedUser, socket]);

  useEffect(() => {
    socket.on("newConnected", () => {
      console.log("New Connected");
      fetchUsers(); // Fetch users when a new user connects
    });

    socket.on("UserDisconnected",({socketId})=>{
      fetchUsers()
    })

    return()=>{
      socket.removeListener("newConnected")
      socket.removeListener("UserDisconnected")
    }
  }, [socket, fetchUsers]);

  useEffect(() => {
    if (selectedUser && username) {
      fetchMessages();
    }
  }, [username, selectedUser]);

  return (
    <div>
      {!loggedInUser ? (
        <div>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRegister();
              }
            }}
          />
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : (
        <div className="users-list-container">
          <h1>Welcome, {loggedInUser.name}</h1>

          <h2>Users List</h2>
          <ul>
            {users.map((user) => {
              if (user.name != username) {
                return (
                  <li key={user._id}>
                    <span className="user-icon">
                      👤
                      {user.isOn && <span className="online-indicator"></span>}
                    </span>
                    {user.name}
                    <button onClick={() => setSelectedUser(user)}>
                      Message
                    </button>
                  </li>
                );
              } else {
                return null;
              }
            })}
          </ul>

          {selectedUser && (
            <div>
              <h3>Chat with {selectedUser.name}</h3>

              <div className="chat-box">
                {messages &&
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${
                        msg.from === username ? "user" : "other"
                      }`}
                    >
                      <strong>{msg.from}:</strong> {msg.message}
                    </div>
                  ))}
              </div>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <button onClick={sendMessage}>Send Message</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersList;
