"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createWebSocket from "../lib/ws";
import React from "react";
import UserProfile from "./ui/UserProfile";
export let clientId = "";
export let gameId = "";
export let hostId = "";
const HomePage = () => {
  const [nickName, setNickName] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");
  const [color, setColor] = useState("");
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [popUp, setPopUp] = useState(true);
  const [popUpMessage, setPopUpMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const ws = createWebSocket(); // Provide your WebSocket server URL
    setSocket(ws);
    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      if (data.clientId) {
        clientId = data.clientId;
        localStorage.setItem("clientId", data.clientId);
      }
    };
  }, []);
  const sendMessage = (payload: any) => {
    if (socket) {
      if (!nickName) {
        setPopUp(true);
        setPopUpMessage("Enter NickName");
        return;
      }
      if (!color) {
        setPopUp(true);
        setPopUpMessage("Select a Color");
        return;
      }
      if (payload.gameId == "") {
        setPopUp(true);
        setPopUpMessage("Enter Game Id");
        return;
      }
      if (payload.event == "create") {
        socket.send(JSON.stringify(payload));
      }
      if (payload.event == "join") {
        socket.send(JSON.stringify(payload));
        gameId = gameIdInput;
        localStorage.setItem("gameId", gameIdInput);
        setColor("red");
        
      }
      setPopUp(true);
      setPopUpMessage("Server is starting/ creating game");
      socket.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        setMessage(data);
        if (data.event == "create" || data.gameId) {
          setPopUp(false)
          gameId = data.gameId;
          hostId = clientId
          localStorage.setItem("gameId", data.gameId);
          router.replace("/game");
        }
        if (data.event == "join") {
          router.replace("/game");
        }
      };
      setTimeout(() => {
        if (!message) {
          setPopUp(true);
          setPopUpMessage("Something Went Wrong");
        }
      }, 5000);
    } else {
      console.warn("WebSocket not initialized yet");
      setPopUpMessage("Server is starting please wait");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-blue-950">
      <div className="w-80 bg-[#3760d121] rounded-md p-5 flex flex-col gap-2 absolute z-50">
        <div className="relative h-2">
          {popUp && (
            <h1 className="text-red-600 text-center w-full absolute -top-3 font-bold">
              {popUpMessage}
            </h1>
          )}
        </div>
        <input
          type="text"
          placeholder="Enter nickName"
          value={nickName || ""}
          className="px-2 py-1 rounded-md outline-none font-semibold"
          onChange={(e) => {
            setNickName(e.target.value);
          }}
        />

        <div className="flex justify-center items-center gap-2 p-2 ">
          <UserProfile
            color="red"
            className="w-1/5  text-red-500 hover:text-red-800"
            onClickFun={() => {
              setColor("red");
            }}
          />
          <UserProfile
            color="green"
            className="w-1/5  text-green-500 hover:text-green-800"
            onClickFun={() => {
              setColor("green");
            }}
          />
          <UserProfile
            color="yellow"
            className="w-1/5 text-yellow-500 hover:text-yellow-800"
            onClickFun={() => {
              setColor("yellow");
            }}
          />
          <UserProfile
            color="pink"
            className="w-1/5  text-pink-500 hover:text-pink-800"
            onClickFun={() => {
              setColor("pink");
            }}
          />
          <UserProfile
            color="orange"
            className="w-1/5  text-orange-500 hover:text-orange-800"
            onClickFun={() => {
              setColor("orange");
            }}
          />
        </div>
        <input
          type="text"
          name=""
          id=""
          placeholder="Game Id"
          className="px-2 py-1 rounded-md outline-none font-semibold"
          onChange={(e) => {
            setGameIdInput(e.target.value);
          }}
        />
        <button
          className="bg-[#38C41C] text-white px-2 py-3 rounded-lg font-semibold "
          onClick={() => {
            setPopUp(true);
            setPopUpMessage("please Wait");
            sendMessage({
              event: "join",
              clientId: clientId,
              gameId: gameIdInput,
              color: color,
              nickName: nickName,
            });
          }}
        >
          Join
        </button>
        <button
          className="bg-[#1671C5] text-white px-2 py-3 rounded-lg font-bold "
          onClick={() => {
            sendMessage({
              event: "create",
              clientId: clientId,
              nickName: nickName,
              color: color,
            });
          }}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default HomePage;
