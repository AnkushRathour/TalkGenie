// Theme toggle
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
// WebSocket
var httpProtocol = 'http://'; 
var wsProtocol = 'ws://';
if (window.location.protocol === 'https:') {
  httpProtocol = 'https://';
  wsProtocol = 'wss://';
}
const socket = new WebSocket(wsProtocol + window.location.host + "/transcribe");
// Recording Button
const recordingButton = document.getElementById("recordingButton");
// Output Box
const output = document.getElementById("output");
let isRecording = false;

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  body.classList.toggle("bg-dark");
  const isDarkTheme = body.classList.contains("bg-dark");
  themeToggle.innerHTML = isDarkTheme
    ? '<i class="bi bi-sun"></i>'
    : '<i class="bi bi-moon"></i>';
});

// Initialize speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.interimResults = false; // Enable interim results
recognition.continuous = false;
recognition.lang = "en-US";

// Event listeners for start and stop buttons
recordingButton.addEventListener("click", toggleRecording);
function toggleRecording() {
  isRecording = !isRecording;
  recordingButton.innerHTML = isRecording
    ? '<i class="bi bi-mic-mute-fill"></i>'
    : '<i class="bi bi-mic-fill"></i>';
  if (isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

// Event listener for when speech recognition starts
recognition.onstart = function () {
  console.log("Speech recognition started...");
  output.innerHTML = "";
  output.innerHTML = '<p class="text-muted">Listening...</p>';
};

// Event listener for interim results
recognition.onresult = function (event) {
  const interimTranscript = Array.from(event.results)
    .map((result) => result[0].transcript)
    .join("");
  output.innerHTML = `<p>${interimTranscript}</p>`;
  socket.send(interimTranscript);
};

// Event listener for when speech recognition ends
recognition.onend = function () {
  console.log("Speech recognition ended.");
  isRecording = !isRecording;
  recordingButton.innerHTML = isRecording
    ? '<i class="bi bi-mic-mute-fill"></i>'
    : '<i class="bi bi-mic-fill"></i>';
};

// Function to start recording
function startRecording() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(() => {
      recognition.start(); // Start recognition
      speechSynthesis.cancel();
      isRecording = true
    })
    .catch((error) => {
      // Microphone is not enabled or available
      console.error("Microphone is not enabled or available:", error);
      alert(
        "Microphone is not enabled or available. Please enable your microphone and refresh the page."
      );
    });
}

function stopRecording() {
  recognition.stop();
  isRecording = false
  output.innerHTML = '<p class="text-muted">Start Recording to begin.</p>'
}

// On reciveing message from socket
socket.onmessage = function (event) {
  stopRecording();
  output.innerHTML = `<p>${event.data}</p>`;
  textToSpeech(event.data);
};

// Speak recieved text from AI
function textToSpeech(phrase) {
  const audio = new Audio();
  const speechSettings = new SpeechSynthesisUtterance(phrase);
  speechSynthesis.speak(speechSettings);
}

// Stop speaking
function stopSpeaker() {
  speechSynthesis.cancel();
}
