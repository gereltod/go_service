import React, { useState } from "react";

const CreateRoom = (props) => {
  const create = async (e) => {
    e.preventDefault();
    const resp = await fetch("http://188.166.255.89:8080/create");
    //const resp = await fetch("http://localhost:8080/create");
    const { room_id } = await resp.json();
    props.history.push(`/room/${room_id}`);
  };
  return (
    <div>
      <button onClick={create}> Create Room</button>
    </div>
  );
};

export default CreateRoom;
