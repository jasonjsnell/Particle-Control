let ssp;

//EEG control vars from control panel
let selectedFrequency;
let selectedAmplitude;

let smoothedFocus = 0;

function setup() {
 
  createCanvas(175, 65);

  selectedFrequency = 10;
  selectedAmplitude = 10;
  
  // Passing in "DATA" as the capture type but data sharing works with "CAPTURE" and "CANVAS" as well
  p5lm = new p5LiveMedia(this, "DATA", null, LIVE_MEDIA_ID);
  p5lm.on('data', didReceiveRtcData);

  setupMuse();
}

function draw() {
  background(0);

  //visual feedback
  let amplitudeOfTargetFrequency = eegSpectrum[selectedFrequency];
  let amountAboveTargetAmplitude = amplitudeOfTargetFrequency - selectedAmplitude;
  if (amountAboveTargetAmplitude < 0) { amountAboveTargetAmplitude = 0; }
  if (amountAboveTargetAmplitude > 10) { amountAboveTargetAmplitude = 10}
  if (smoothedFocus < amountAboveTargetAmplitude-1) { 
    smoothedFocus += 0.25; 
  } else if (smoothedFocus > amountAboveTargetAmplitude+1) {
    smoothedFocus -= 0.1;
  }

  let circleAlpha = map(smoothedFocus, 0, 10, 0, 255)
  let circleSize = map(smoothedFocus, 10, 0, 20, width);
  //console.log("dist from target", distanceFromTargetAmplitude);
  let circleColor = color(50, 190, 255, circleAlpha);
  noStroke();
  fill(circleColor);
  circle(width/2, height/2, circleSize);

  fill(255);
  
  textSize(10);
  text('BATTERY: ' + batteryLevel + "%", 10, 20);

  text('TARGET FREQUENCY: ' + selectedFrequency + ' Hz', 10, 35);
  text('AMPLITUDE THRESHOLD: ' + selectedAmplitude + ' mV', 10, 50);
  
}

function didReceiveRtcData(data, id) {

  print(id + ":" + data);
  
  // If it is JSON, parse it
  let jsonData = JSON.parse(data);

  console.log("received data", data, id)
  
  if (jsonData.type == SLIDER_AMP_ID) {
    selectedAmplitude = jsonData.amp
  } else if (jsonData.type == SLIDER_FREQ_ID) {
    selectedFrequency = jsonData.freq
  }
}

//muse device listeners
function didUpdateEeg(){
  //console.log("didUpdateEeg:", eeg);
  eeg.type = EEG_ID;
  eeg.spectrum = eegSpectrum;
  p5lm.send(JSON.stringify(eeg));
}
function didUpdatePpg(){
  //console.log("didUpdatePpg:", ppg);
  ppg.type = PPG_ID;
  p5lm.send(JSON.stringify(ppg));
}
function didUpdateAccel(){
  //console.log("didUpdateAccel:", accel);
  //add "type" to current package and send
  accel.type = ACCEL_ID;
  p5lm.send(JSON.stringify(accel));
}
function didUpdateBatteryLevel(){
  //package up into a js object with a "type"
  let batteryData = { 
    type: BATTERY_ID,
    batteryLevel: batteryLevel 
  }
  p5lm.send(JSON.stringify(batteryData));
}





// //WEBRTC
// function mouseMoved() {
//   console.log("mousemoved")
//   // Package as JSON to send
//   let dataToSend = {x: mouseX, y: mouseY};
  
//   // Send it
//   p5lm.send(JSON.stringify(dataToSend));
// }