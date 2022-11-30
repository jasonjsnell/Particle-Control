//socket connection
let socket = io();

//connect socket client 
socket.on('connect', () => {
  console.log("client connected")
});

//listen for data from server
//this happens when another client changes a slider
//and this client needs to update its interface
socket.on('changeFreqSlider', (data) => {
  selectedFrequency = data.freq;
  freqSlider.value(selectedFrequency);
})

socket.on('changeAmpSlider', (data) => {
  selectedAmplitude = data.amp
  ampSlider.value(selectedAmplitude);
})