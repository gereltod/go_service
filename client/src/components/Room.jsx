import React, { useEffect, useRef } from "react";

const Room = (props) => {
  const userVideo = useRef();
  const userStream = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const webSocketRef = useRef();

  const openCamera = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const cameras = allDevices.filter((device) => device.kind === "videoinput");
    console.log(cameras);
    const constraints = {
      audio: true,
      video: {
        // deviceId: cameras[0].deviceId,
        deviceId: cameras[0].deviceId,
      },
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    openCamera().then((stream) => {
      userVideo.current.srcObject = stream;
      userStream.current = stream;

      // webSocketRef.current = new WebSocket(
      //   //`ws://localhost:8080/join?roomID=${props.match.params.roomID}`
      // );

      webSocketRef.current = new WebSocket(
        `wss://api.tulbur.mn:82/join?roomID=${props.match.params.roomID}`
      );

      webSocketRef.current.addEventListener("open", () => {
        webSocketRef.current.send(JSON.stringify({ join: true }));
      });

      console.log(webSocketRef.current);

      webSocketRef.current.addEventListener("message", async (e) => {
        const message = JSON.parse(e.data);
        if (message.join) {
          callUser();
        }

        if (message.offer) {
          handleOffer(message.offer);
        }

        if (message.answer) {
          console.log("Recieiving Answer");
          peerRef.current.setRemoteDescription(
            new RTCSessionDescription(message.answer)
          );
        }

        if (message.iceCandidate) {
          console.log("Receive and Adding Ice Candidate", message.iceCandidate);
          try {
            await peerRef.current.addIceCandidate(message.iceCandidate);
          } catch (err) {
            console.log("Error Receiving ICE Candidate", err);
          }
        }
      });
    });
  });

  const handleOffer = async (offer) => {
    console.log("Received offer Creating Answer");
    peerRef.current = createPeer();
    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    userStream.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, userStream.current);
    });

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    webSocketRef.current.send(
      JSON.stringify({ answer: peerRef.current.localDescription })
    );
  };

  const callUser = () => {
    console.log("Calling other user");
    peerRef.current = createPeer();
    userStream.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, userStream.current);
    });
  };

  const createPeer = () => {
    console.log("Creating Peer Connection");
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onnegotiationneeded = handleNegotiationNeeded;
    peer.onicecandidate = handleIceCandidateEvent;
    peer.ontrack = handleTrackEvent;

    return peer;
  };

  const handleIceCandidateEvent = async (e) => {
    console.log("Found Ice Candidate");

    if (e.candidate) {
      console.log(e.candidate);
      await webSocketRef.current.send(
        JSON.stringify({ iceCandidate: e.candidate })
      );
    }
  };

  const handleNegotiationNeeded = async () => {
    console.log("Creating offer");

    try {
      const myOffer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(myOffer);
      webSocketRef.current.send(
        JSON.stringify({ offer: peerRef.current.localDescription })
      );
    } catch (err) {}
  };

  const handleTrackEvent = (e) => {
    console.log("Received Traks");
    partnerVideo.current.srcObject = e.streams[0];
  };

  return (
    <div>
      <video autoPlay muted controls={true} ref={userVideo}></video>
      <video autoPlay controls={true} ref={partnerVideo}></video>
    </div>
  );
};

export default Room;
