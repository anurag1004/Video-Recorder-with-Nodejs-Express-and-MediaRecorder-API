$(document).ready(()=>{
    const record =$('#record'),
    stop = $('#stop'),
    recorded=$('#recorded'),
    send=$('#send');
    var canvas = document.getElementById('mycanvas');
        var ctx = canvas.getContext('2d');
        // var canvas_text = document.getElementById('canvas_text');
        // var text = canvas_text.getContext('2d');
    //cntx=$(canvas)[0].getContext('2d');
     let chunks = [];
     let blob=[];
     var video = document.querySelector("#videoElement");
     $(video).prop('muted', true);
     const show=$('#show-video');
     let status=true;
     //canavs//
     $(show).on('click',(event)=>{
        if(status){
          
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                 video.srcObject = stream;
                 })
                 .catch(function (error) {
                 console.log("Something went wrong!");
                 });
             }
        }else{
            video.srcObject=null;
            stream=null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        status=!status;
       
     })
     video.onplay = function() {
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        draw();
     };
    function draw() {
        if(video.paused || video.ended) return false;
        ctx.drawImage(video, 0, 0);
        setTimeout(draw, 10);
    }
    /////
    async function getMedia(content){
        let stream=null;
        let options={
            audioBitsPerSecond : 128000,
            videoBitsPerSecond: 2500000,
            mimeType:'video/webm'
        };
        try{
            stream = await navigator.mediaDevices.getUserMedia(content);
            console.log('got the stream!');
            console.log(stream);
            let mediaRecorder = new MediaRecorder(stream,options);
            $(record).on('click',(event)=>{
                mediaRecorder.start();
                console.log(mediaRecorder.state);
                console.log("recorder started");
                let i=0;
                mediaRecorder.ondataavailable = function(e) {
                    chunks.push(e.data);
                }

            })
            $(stop).on('click',(event)=>{
                mediaRecorder.stop();
                console.log(mediaRecorder.state);
                console.log("recorder stopped");
            })
            mediaRecorder.onstop=(e)=>{
                blob = new Blob(chunks, { 'type' : 'video/webm; codecs=opus' });
                console.log(blob);
                chunks = [];
                var videoURL = window.URL.createObjectURL(blob);
                console.log(videoURL);
                $(recorded).attr('src',videoURL);
            }
            $(send).on('click',(event)=>{
                var xhr=new XMLHttpRequest();
                xhr.onload=function(e) {
                    if(this.readyState === 4) {
                        console.log("Server returned: ",e.target.responseText);
                    }
                };
                var fd=new FormData();
                fd.append("video_data",blob, "filename.mp4");
                xhr.open("POST","/save-video",true);
                xhr.send(fd);
            })

        }catch(err){
            console.log(err);
        }
    }
    const content ={ audio : true, video: true,sampleRate: 48000, sampleSize: 32, channelCount: {ideal:2,min:1}};
    getMedia(content);
})