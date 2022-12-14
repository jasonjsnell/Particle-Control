let ssp;

//placeholders for incoming values from visualizer
let batteryLevel = 0;
let accel = {
  x:0, y:0, z:0
};
let ppg = {
  bpm: 0, heartbeat:false, amplitude: 0
}

let eeg = {
  delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0, spectrum: []
}

//sliders to control EEG params
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

  //setupMuse();
  
  // Passing in "DATA" as the capture type but data sharing works with "CAPTURE" and "CANVAS" as well
  p5lm = new p5LiveMedia(this, "DATA", null, LIVE_MEDIA_ID);
  // "data" callback
  p5lm.on('data', didReceiveRtcData);
}

function draw() {
  background(220);

  //visual feedback
  // let amplitudeOfTargetFrequency = eegSpectrum[selectedFrequency];
  // let amountAboveTargetAmplitude = amplitudeOfTargetFrequency - selectedAmplitude;
  // if (amountAboveTargetAmplitude < 0) { amountAboveTargetAmplitude = 0; }
  // if (amountAboveTargetAmplitude > 10) { amountAboveTargetAmplitude = 10}
  // if (smoothedFocus < amountAboveTargetAmplitude-1) { 
  //   smoothedFocus += 0.25; 
  //   console.log("up")
  // } else if (smoothedFocus > amountAboveTargetAmplitude+1) {
  //   smoothedFocus -= 0.1;
  //   console.log("down")
  // }

  // let circleAlpha = map(smoothedFocus, 0, 10, 0, 255)
  // let circleSize = map(smoothedFocus, 10, 0, 20, width);
  // //console.log("dist from target", distanceFromTargetAmplitude);
  // let circleColor = color(50, 190, 255, circleAlpha);
  // noStroke();
  // fill(circleColor);
  // circle(width/2, height/2, circleSize);

  //if values are new...
  if (selectedFrequency != freqSlider.value()) {
    selectedFrequency = freqSlider.value();
    
    //emit data to server, using custom data event name
    let freqData = { 
      type: SLIDER_FREQ_ID,
      freq: selectedFrequency,
    }
    
    //send data with type to other peer
    p5lm.send(JSON.stringify(freqData));
  }

  if (selectedAmplitude != ampSlider.value()) {
    selectedAmplitude = ampSlider.value();
    
    //send data with type to other peer
    let ampData = { 
      type: SLIDER_AMP_ID,
      amp: selectedAmplitude 
    }

    // Send it
    p5lm.send(JSON.stringify(ampData));
  }

  //EEG chart
  beginShape();
  strokeWeight(1);
  noFill();
  stroke(255, 255, 255);

  for (let i = 1; i <= (eeg.spectrum.length/2); i++) {
   let x = map(i, 1, eeg.spectrum.length/2, 0, width);
   let y = map(eeg.spectrum[i], 0, 50, height, 0);
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

  if (ppg.heartbeat) {
    text("HEART bpm: " + ppg.bpm + " ???", 10, 120);
  } else {
    text("HEART bpm: " + ppg.bpm, 10, 120);
  }

  text('ACCEL: ' + Math.round(accel.x) + "  " + Math.round(accel.y) + "  " + Math.round(accel.z), 10, 150);

  text('ACCEL: ' +  10, 130);
  
  textSize(12);
  text('Target frequency: ' + selectedFrequency + ' Hz', 25, height-18);
  text('Amplitude threshold: ' + selectedAmplitude + ' mV', width * 0.5, height-18);
  
  
}

function didReceiveRtcData(data, id) {

  // If it is JSON, parse it
  let jsonData = JSON.parse(data);

  console.log("received data", jsonData, id)

  if (jsonData.type == EEG_ID) {
    eeg = jsonData
  } else if (jsonData.type == PPG_ID) {
    ppg = jsonData
  } else if (jsonData.type == ACCEL_ID) {
    accel = jsonData
  } else if (jsonData.type == BATTERY_ID) {
    batteryLevel = jsonData.batteryLevel + "%"
  }

}
