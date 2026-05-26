const tracks = [
  { name: "RECLAIM 2.5 - bgm_0", src: "./assets/audio/ost/reclaim-2.5/bgm_0.mp3" },
  { name: "RECLAIM 2.5 - bgm_1", src: "./assets/audio/ost/reclaim-2.5/bgm_1.mp3" },
  { name: "RECLAIM 2.5 - bgm_2", src: "./assets/audio/ost/reclaim-2.5/bgm_2.mp3" },
];

const toggle = document.getElementById("ostToggle");
const next = document.getElementById("ostNext");
const status = document.getElementById("ostStatus");
const audio = new Audio();
let trackIndex = 0;

audio.loop = false;
audio.preload = "none";
audio.volume = 0.42;

if (toggle && next && status) {
  setTrack(0, false);
  toggle.addEventListener("click", togglePlayback);
  next.addEventListener("click", () => setTrack(trackIndex + 1, true));
  audio.addEventListener("ended", () => setTrack(trackIndex + 1, true));
  audio.addEventListener("pause", render);
  audio.addEventListener("play", render);
}

function setTrack(index, shouldPlay) {
  trackIndex = (index + tracks.length) % tracks.length;
  audio.src = tracks[trackIndex].src;
  audio.currentTime = 0;
  render();
  if (shouldPlay) play();
}

function togglePlayback() {
  if (audio.paused) play();
  else audio.pause();
}

async function play() {
  try {
    await audio.play();
  } catch {
    status.textContent = "클릭 후 다시 재생";
  }
  render();
}

function render() {
  const track = tracks[trackIndex];
  toggle.textContent = audio.paused ? "OST 재생" : "OST 정지";
  status.textContent = track.name;
}
