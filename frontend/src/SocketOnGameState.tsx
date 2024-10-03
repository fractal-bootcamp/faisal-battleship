import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000"
const socket = io(SERVER_URL)

socket.on("connect", () => {
    console.log("Connected to the server.");

    socket.emit("testEvent", { message: "Hellow from client" })
})

socket.on("disconnect", () => {
    console.log("Disconnected from the server.");
})

export default socket;