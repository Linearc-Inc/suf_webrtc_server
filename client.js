// getting dom elements
let divSelectRoom = document.getElementById("selectRoom");
let inputRoomNumber = document.getElementById("roomNumber");
let btnJoinRoom = document.getElementById("joinRoom");
let btnCreateRoom = document.getElementById("createRoom");

let divConsultingRoom = document.getElementById("consultingRoom");
let ScreenVideo = document.getElementById("ScreenVideo");
let CameraVideo = document.getElementById("CameraVideo");

// letiables
let roomNumber;
// let localStream;
let CameraStream;
let ScreenStream;

let rtcPeerConnection;

let iceServers = {
    'iceServers': [
        { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' }
    ]
}
let streamConstraints = { audio: true, video: true };
let isBroadcaster;

function hasUserMedia() {
    //check if the browser supports the WebRTC
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);
}

function hasDisplayMedia() {
    return !!(navigator.mediaDevices.getDisplayMedia || navigator.mediaDevices.webkitGetDisplayMedia || navigator.mediaDevices.mozGetDisplayMedia);
}

// Let's do this
let socket = io('localhost:3000');

btnCreateRoom.onclick = function () {
    if (inputRoomNumber.value === '') {
        alert("Please type a room number")
    } else {
        roomNumber = inputRoomNumber.value;
        socket.emit('create a room', roomNumber);
        divSelectRoom.style = "display: none;";
        divConsultingRoom.style = "display: block;";
    }
};

btnJoinRoom.onclick=function (){
    if (inputRoomNumber.value === '') {
        alert("Please type a room number")
    } else {
        roomNumber = inputRoomNumber.value;
        socket.emit('join a room', roomNumber);
        divSelectRoom.style = "display: none;";
        divConsultingRoom.style = "display: block;";
    }
}


// message handlers
socket.on('created', function (room) {
    if (hasUserMedia()) {
        //enabling video and audio channels
        navigator.getUserMedia(streamConstraints, function (stream) {
            //inserting our stream to the video tag
            CameraStream=stream;
            CameraVideo.srcObject = stream;
        }, function (err) {});
    } else {
        alert("Camera not surported");
    }
    
    if (hasDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(streamConstraints).then( (stream)=>{
            ScreenStream=stream
            ScreenVideo.srcObject = stream;
        } 
        )
    } else {
        alert("Screen Share not surported");
    }
    isBroadcaster = true;
});

socket.on('joined', function (room) {
    console.log('joined')
    isBroadcaster = false;
    socket.emit('ready', roomNumber);
});

socket.on('candidate', function (event) {
    console.log('candidate')
    let candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    });
    rtcPeerConnection.addIceCandidate(candidate);
});

socket.on('ready', function () {
    console.log("socket ready")
    if (isBroadcaster) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.addTrack(ScreenStream.getTracks()[0], ScreenStream );
        rtcPeerConnection.addTrack(ScreenStream.getTracks()[1], ScreenStream);
        
        rtcPeerConnection.createOffer()
            .then(sessionDescription => {
                rtcPeerConnection.setLocalDescription(sessionDescription);
                console.log('emmiting offer')
                socket.emit('offer', {
                    type: 'offer',
                    sdp: sessionDescription,
                    room: roomNumber
                });
            })
            .catch(error => {
                console.log(error)
            })
    }
});

socket.on('offer', function (event) {
    console.log('offer created')
    if (!isBroadcaster) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.ontrack = onAddStream;
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        rtcPeerConnection.createAnswer()
            .then(sessionDescription => {
                rtcPeerConnection.setLocalDescription(sessionDescription);
                socket.emit('answer', {
                    type: 'answer',
                    sdp: sessionDescription,
                    room: roomNumber
                });
            })
            .catch(error => {
                console.log(error)
            })
    }
});

socket.on('answer', function (event) {
    console.log(event)
    console.log('answered')
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
})

// handler functions
function onIceCandidate(event) {
    console.log("ice candidate")
    if (event.candidate) {
        console.log('sending ice candidate');
        socket.emit('candidate', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: roomNumber
        })
    }
}

function onAddStream(event) {
    console.log(event);
    CameraVideo.srcObject = event.streams[0];
    CameraStream = event.stream;
}