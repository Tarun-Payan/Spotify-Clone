let currentFolder;
var currentSong;
let songs;

async function getSongs(track){
    let a = await fetch("http://127.0.0.1:3000/Music/" + track);
    // http://127.0.0.1:3000/Music/my-playlist2/
    let songsObj = await a.text();
    let div = document.createElement("div");
    div.innerHTML = songsObj;
    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href);
        }
    }
    
    return songs;
}

async function main(){
    let songs2 = [];
    currentFolder = "my-playlist2";
    songs = await getSongs(currentFolder);
    // let currentSong = songs[0];
    currentSong = new Audio(songs[0]);

    // http://127.0.0.1:3000/Music/my-playlist2/1.mp3
    // Remove text from song that we not need like http: 
    for (const key in songs) {
        let song = songs[key].split("my-playlist2/")
        song = song[1].slice(0, -4).replaceAll("%20", " ");
        
        if(song.length > 60){
            song = song.slice(0, 57) + "...";
        }
        songs2.push(song)
    }

    document.querySelector(".song-title").innerHTML = songs2[0];

    let songUL = document.querySelector(".library-list").getElementsByTagName("ul")[0];
    songs2.forEach(element => {
        // songUL.innerHTML += `<li> ${element}</li>`;
        songUL.innerHTML += `<li>
        <img src="Images/song-icon.png" height="34" alt="song-icon">
        <span class="txt">${element}</span>
        <img src="Images/play.png" alt="play icon" height="50">
    </li>`;
    });

    // Cheng current song when we click on song in songs list
    let element = Array.from(document.querySelectorAll(".library-list ul li"))
    for (const key in element){
        element[key].addEventListener("click", ()=>{
            let songURL = songs[key];
            // console.log(document.querySelectorAll(".library-list ul li")[key])

            // console.log("set song is ", songURL)
            if(currentSong.src != songURL){
                currentSong.pause();
                currentSong = new Audio(songURL);
                currentSong.addEventListener("timeupdate", updateTime)
                document.querySelector(".song-title").innerHTML = songs2[key];
                currentSong.play();
                document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].src = "Images/pause-button.png";
            }
            else{
                if(!currentSong.paused){
                    currentSong.pause()
                    document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].src = "Images/play-button.png";
                }
                else{
                    currentSong.play()
                    document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].src = "Images/pause-button.png";
                }
            }
        });
    }

    // Add event in seekbar play button
    document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].addEventListener("click", ()=>{
        // Below is play button image
        let play_button = document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0]
        
        if(play_button.src.endsWith("Images/play-button.png")){
            currentSong.play()
            play_button.src = "Images/pause-button.png";
        }
        else{
            currentSong.pause()
            play_button.src = "Images/play-button.png";
        }
    })

    // Add event to previous song button
    document.getElementsByClassName("song-play-buttons")[0].getElementsByTagName("img")[0].addEventListener("click", ()=>{
        let posCurrentSong = songs.indexOf(currentSong.src)
        
        if(posCurrentSong != 0){
            let checkC = 0;
            if(!currentSong.paused){
                currentSong.pause()
                checkC = 1
            }
            currentSong = new Audio(songs[posCurrentSong - 1]);
            currentSong.addEventListener("timeupdate", updateTime)
            document.querySelector(".song-title").innerHTML = songs2[posCurrentSong - 1];
            if(checkC == 1){
                currentSong.play()
            }
        }
    })
    
    // Add event to next song button
    document.getElementsByClassName("song-play-buttons")[2].getElementsByTagName("img")[0].addEventListener("click", ()=>{
        let posCurrentSong = songs.indexOf(currentSong.src)
        
        if(posCurrentSong != songs.length -1){
            let checkC = 0;
            if(!currentSong.paused){
                currentSong.pause()
                checkC = 1
            }
            currentSong = new Audio(songs[posCurrentSong + 1]);
            document.querySelector(".song-title").innerHTML = songs2[posCurrentSong + 1];
            currentSong.addEventListener("timeupdate", updateTime); 
            if(checkC == 1){
                currentSong.play()
            }
        }
    })

    // Add onchange event to volume button's range
    document.getElementById("range").addEventListener("change", ()=>{
        let volume = document.getElementById("range").value;
        currentSong.volume = volume/100

        if(volume > 40){
            document.getElementsByClassName("volume")[0].getElementsByTagName("img")[0].src = "Images/volume3.svg";
        }
        else if (volume > 0) {
            document.getElementsByClassName("volume")[0].getElementsByTagName("img")[0].src = "Images/volume2.svg";            
        } 
        else {
            document.getElementsByClassName("volume")[0].getElementsByTagName("img")[0].src = "Images/volume1.svg";
        }
    })

    // Add event on volume image
    document.getElementsByClassName("volume")[0].getElementsByTagName("img")[0].addEventListener("click", ()=>{
        let volume = document.getElementById("range").value;
        if(volume > 0){
            document.getElementsByClassName("volume")[0].getElementsByTagName("img")[0].src = "Images/volume1.svg";
            document.getElementById("range").value = 0;
            currentSong.volume = 0;
        }
        else if(volume == 0){
            document.getElementById("range").value = 20;
            currentSong.volume = 0.2;

            document.getElementsByClassName("volume")[0].getElementsByTagName("img")[0].src = "Images/volume2.svg";
        }
    })

    
    // Set seekbar as song time
    function secondsToMinutesSeconds(time){
        let minutes = Math.floor(time / 60)
        let seconds = Math.floor(time - (minutes * 60))

        if(minutes < 10){
            minutes = "0" + minutes;
        }
        if(seconds < 10){
            seconds = "0" + seconds;
        }

        if(isNaN(minutes)){
            return "00:00";
        }
        else{
        return `${minutes}:${seconds}`
        } 
    }

    function updateTime(){
        // console.log("timeupdate event fired");
        document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".dot").style.left = (currentSong.currentTime * 100) / currentSong.duration + "%";

        // When current song will end then next song should play
        if(currentSong.currentTime == currentSong.duration){
            let posCurrentSong = songs.indexOf(currentSong.src)
        
            if(posCurrentSong != songs.length -1){
                currentSong.pause()
                currentSong = new Audio(songs[posCurrentSong + 1]);
                document.querySelector(".song-title").innerHTML = songs2[posCurrentSong + 1];
                currentSong.addEventListener("timeupdate", updateTime); 
                currentSong.play()
            }
        }
    }

    currentSong.addEventListener("timeupdate", updateTime)

    // add event onckick to seekbar, where we click on seekbar song will start from there
    document.querySelector(".seekbar").addEventListener("click", (event)=>{
        let percentage = (event.offsetX * 100) / event.target.getBoundingClientRect().width;
        let perc_time = (percentage * currentSong.duration) / 100;
        currentSong.currentTime = (percentage * (currentSong.duration)) / 100;
        document.querySelector(".dot").style.left = percentage + "%";
    })

    // Add event to hamburger
    document.getElementById("hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0px";
    })

    // Add event to close
    document.getElementById("close-btn").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-350px";
    })

    // Add event when we click on card
    let cards = Array.from(document.querySelectorAll(".card"))
    // console.log(cards)
    cards.forEach(element => {
        element.addEventListener("click", async ()=>{
            currentSong.pause()
            document.querySelector(".dot").style.left = "0%";
            document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].src = "Images/play-button.png";

            let cf = element.id + ""
            currentFolder = cf
            currentFolder = toString(element.id)

            songs = await getSongs(element.id);
            currentSong = new Audio(songs[0]);


            // http://127.0.0.1:3000/Music/my-playlist2/1.mp3
            // Remove text from song that we not need like http: 
            songs2 = [];
            for (const key in songs) {
                let song = songs[key].split(`${element.id}/`)
                if(song[1].includes("%20")){
                    song = song[1].slice(0, -4).replaceAll("%20", " ");
                }
                else{
                    song = song[1].slice(0, -4).replaceAll("%", " ");
                }
                
                if(song.length > 60){
                    song = song.slice(0, 57) + "...";
                }
                songs2.push(song)
            }

            document.querySelector(".song-title").innerHTML = songs2[0];

            songUL = document.querySelector(".library-list").getElementsByTagName("ul")[0];
            songUL.innerHTML = " ";
            songs2.forEach(element => {
                // songUL.innerHTML += `<li> ${element}</li>`;
                songUL.innerHTML += `<li>
                <img src="Images/song-icon.png" height="34" alt="song-icon">
                <span class="txt">${element}</span>
                <img src="Images/play.png" alt="play icon" height="50">
                </li>`;
            });

            // Add all songs in songs list
            element = Array.from(document.querySelectorAll(".library-list ul li"))
            for (const key in element){
                element[key].addEventListener("click", ()=>{
                    let songURL = songs[key];
                    // console.log(document.querySelectorAll(".library-list ul li")[key])

                    // console.log("set song is ", songURL)
                    if(currentSong.src != songURL){
                        currentSong.pause();
                        currentSong = new Audio(songURL);
                        currentSong.addEventListener("timeupdate", updateTime)
                        document.querySelector(".song-title").innerHTML = songs2[key];
                        currentSong.play();
                        document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].src = "Images/pause-button.png";
                    }
                    else{
                        if(!currentSong.paused){
                            currentSong.pause()
                            document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].src = "Images/play-button.png";
                        }
                        else{
                            currentSong.play()
                            document.getElementsByClassName("song-play-buttons")[1].getElementsByTagName("img")[0].src = "Images/pause-button.png";
                        }
                    }
                });
            }
        })
    });
}

main()