//socket connection
let socket = io();

//connect socket client 
socket.on('connect', () => {
  console.log("client connected")
});

//listen for data from server
socket.on('changeFreqSlider', (data) => {
  
  //another client has set the slider value
  //update it locally
  freqSlider.value(data.freq);
   
})

socket.on('changeAmpSlider', (data) => {
  
  //another client has set the slider value
  //update it locally
  ampSlider.value(data.amp);
   
})

let freqSlider;
let ampSlider;

let selectedFrequency;
let selectedAmplitude;

function setup() {

  createCanvas(400, 400);

  selectedFrequency = 10;
  freqSlider = createSlider(1, 60, selectedFrequency);
  freqSlider.position(20, height-50);
  freqSlider.style('width', (width*0.3) + 'px');

  selectedAmplitude = 10;
  ampSlider = createSlider(0, 60, selectedAmplitude);
  ampSlider.position(width * 0.5, height-50);
  ampSlider.style('width', (width*0.3) + 'px');

  setupMuse();

}

function draw() {

  background(200);

  //if values are new...
  if (selectedFrequency != freqSlider.value()) {
    selectedFrequency = freqSlider.value();
    
    //emit data to server, using custom data event name
    let freqData = { freq: selectedFrequency }
    socket.emit('changeFreqSlider', freqData);
  }

  if (selectedAmplitude != ampSlider.value()) {
    selectedAmplitude = ampSlider.value();
    
    //emit data to server, using custom data event name
    let ampData = { amp: selectedAmplitude }
    socket.emit('changeAmpSlider', ampData);
  }


  textSize(10);
  text('BATTERY: ' + batteryLevel, width-80, 10);
  
  textSize(12);
  text('FFT: ' + Math.round(spectrum[selectedFrequency]), 10, 30);

  text('Target frequency: ' + selectedFrequency + ' Hz', 25, height-18);
  text('Target amplitude: ' + selectedAmplitude + ' mV', width * 0.5, height-18);
  

}
