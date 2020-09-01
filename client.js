document.addEventListener('DOMContentLoaded', (event) => {
    let createBroadcastBtn = document.querySelector('#createRoom');
    let viewBtn = document.querySelector('#joinRoom');
    let selectRoom = document.querySelector('#selectRoom');
    let channel_id = document.querySelector("#roomNumber");
    let camerasource = document.querySelector('#mylivevideo')
    let screensource = document.querySelector('#mylivescreen')
    let ourcamera;
    let ourscreen;



    createBroadcastBtn.addEventListener('click', function (e) {
        let peer = new Peer(channel_id.value,{
            config: {
                'iceServers': [{
                        url: 'stun:stun.l.google.com:19302'
                    },
                    {
                        url: 'turn:numb.viagenie.ca:3478',
                        credential: 'muazkh',
                        username: 'web...@live.com'
                    },
                    {
                        url: 'turn:numb.viagenie.ca',
                        credential: 'muazkh',
                        username: 'web...@live.com'
                    },
                    {
                        url: 'turn:192.158.29.39:3478?transport=udp',
                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        username: '28224511:1379330808'
                    },
                    {
                        url: 'turn:192.158.29.39:3478?transport=tcp',
                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        username: '28224511:1379330808'
                    }
                ]
            }
        });

        peer.on('open', function (id) {
            console.log('My peer ID is: ' + id);
        });

        navigator.getUserMedia({
            audio: true,
            video: true
        }, function (stream) {
            ourcamera = stream;
        }, function (err) {});

        navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true
        }).then((stream) => {
            ourscreen = stream
        })

        console.log("got user data")
        peer.on('connection', function (conn) {
            console.log('making camera call')
            let cameracall = peer.call(conn.peer, ourcamera, {
                metadata: JSON.stringify({
                    type: "camera"
                })
            });
            console.log('making screen call')
            let screencall = peer.call(conn.peer, ourscreen, {
                metadata: JSON.stringify({
                    type: "screen"
                })
            });

        });

    })


    viewBtn.addEventListener('click', function (e) {
        let peer = new Peer({
            config: {
                'iceServers': [{
                        url: 'stun:stun.l.google.com:19302'
                    },
                    {
                        url: 'turn:numb.viagenie.ca:3478',
                        credential: 'muazkh',
                        username: 'web...@live.com'
                    },
                    {
                        url: 'turn:numb.viagenie.ca',
                        credential: 'muazkh',
                        username: 'web...@live.com'
                    },
                    {
                        url: 'turn:192.158.29.39:3478?transport=udp',
                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        username: '28224511:1379330808'
                    },
                    {
                        url: 'turn:192.158.29.39:3478?transport=tcp',
                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        username: '28224511:1379330808'
                    }
                ]
            }
        });

        peer.on('open', function (id) {
            console.log('My peer ID is: ' + id);
            let conn = this.connect(channel_id.value);

            peer.on('call', function (call) {
                console.log('recieving call from host', JSON.parse(call.metadata).type)
                console.log(call)
                call.answer();
                call.on('stream', function (stream) {
                    console.log(stream)
                    let source = (JSON.parse(call.metadata).type)
                    if (source == "camera") {
                        camerasource.srcObject = stream;
                        console.log(camerasource)
                        camerasource.onloadedmetadata = function (e) {
                            camerasource.play();
                        }
                    } else {
                        screensource.srcObject = stream;
                        console.log(camerasource)
                        screensource.onloadedmetadata = function (e) {
                            screensource.play();
                        }
                    }
                });
            });
        });

    })



});