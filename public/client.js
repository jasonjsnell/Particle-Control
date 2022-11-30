
let freqSlider;
let ampSlider;

let selectedFrequency;
let selectedAmplitude;

let smoothedFocus = 0;

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

  //visual feedback
  let amplitudeOfTargetFrequency = eegSpectrum[selectedFrequency];
  let amountAboveTargetAmplitude = amplitudeOfTargetFrequency - selectedAmplitude;
  if (amountAboveTargetAmplitude < 0) { amountAboveTargetAmplitude = 0; }
  if (amountAboveTargetAmplitude > 10) { amountAboveTargetAmplitude = 10}
  if (smoothedFocus < amountAboveTargetAmplitude-1) { 
    smoothedFocus += 0.25; 
    console.log("up")
  } else if (smoothedFocus > amountAboveTargetAmplitude+1) {
    smoothedFocus -= 0.1;
    console.log("down")
  }

  let circleAlpha = map(smoothedFocus, 0, 10, 0, 255)
  let circleSize = map(smoothedFocus, 10, 0, 20, width);
  //console.log("dist from target", distanceFromTargetAmplitude);
  let circleColor = color(50, 190, 255, circleAlpha);
  noStroke();
  fill(circleColor);
  circle(width/2, height/2, circleSize);

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

  // EEG chart
  beginShape();
  strokeWeight(1);
  noFill();
  stroke(255, 255, 255);

  for (let i = 1; i <= (eegSpectrum.length/2); i++) {
   let x = map(i, 1, eegSpectrum.length/2, 0, width);
   let y = map(eegSpectrum[i], 0, 50, height, 0);
   vertex(x, y); //<-- draw a line graph
  }
  endShape();

  noStroke();
  fill(0);
  
  textSize(10);
  text('BATTERY: ' + batteryLevel, width-80, 10);

  textSize(12);
  text('DELTA: ' + eeg.delta, 10, 30);
  text('THETA: ' + eeg.theta, 10, 45);
  text('ALPHA: ' + eeg.alpha, 10, 60);
  text('BETA:  ' + eeg.beta,  10, 75);
  text('GAMMA: ' + eeg.gamma, 10, 90);
  
  textSize(12);
  text('Target frequency: ' + selectedFrequency + ' Hz', 25, height-18);
  text('Amplitude threshold: ' + selectedAmplitude + ' mV', width * 0.5, height-18);
  
  

}
