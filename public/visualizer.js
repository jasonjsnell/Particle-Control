let ssp;

//EEG control vars from control panel
let selectedFrequency;
let selectedAmplitude;
let F_ACTUAL_MAX = 50;
let fActual = 0;
let fMomentum = 0;
let fSmoothed = 0;

let soundAnalog, soundArasian, soundBrass, soundGlass, soundStrings, soundSparkle
let focusSounds;
let SOUND_ANALOG_VOL = 0.6
let SOUND_ARASIAN_VOL = 0.5
let SOUND_BRASS_VOL = 0.6
let SOUND_GLASS_VOL = 1.0
let SOUND_STRINGS_VOL = 1.0
let SOUND_SPARKLE_VOL = 0.7


function preload() {
  // preload() runs once
  soundAnalog = loadSound('assets/sound/loop-analog.wav');
  soundArasian = loadSound('assets/sound/loop-arasian.wav');
  soundBrass = loadSound('assets/sound/loop-brass.wav');
  soundGlass = loadSound('assets/sound/loop-glass.wav');
  soundStrings = loadSound('assets/sound/loop-synth-strings.wav');
  soundSparkle = loadSound('assets/sound/loop-sparkle.wav');
}

function setup() {

  let cnv = createCanvas(175, 65);
  cnv.position(windowWidth - width - 10, windowHeight - height - 10);

  selectedFrequency = 2;
  selectedAmplitude = 10;

  // Passing in "DATA" as the capture type but data sharing works with "CAPTURE" and "CANVAS" as well
  p5lm = new p5LiveMedia(this, "DATA", null, LIVE_MEDIA_ID);
  p5lm.on('data', didReceiveRtcData);

  setupMuse();

}

function draw() {
  background(0);

  //visual feedback

  //what is the microvolt amplitude at the selected frequency?
  let amplitudeOfTargetFrequency = eegSpectrum[selectedFrequency];

  //how much is that amplitude above the specified amplitude threshold?
  fActual = amplitudeOfTargetFrequency - selectedAmplitude;

  //keep values between 0 and 10
  if (fActual < 0) { fActual = 0; }
  if (fActual > F_ACTUAL_MAX) { fActual = F_ACTUAL_MAX }

  //if actual number if above smoothed number
  //cloud is getting smaller and more dense
  if (fActual > fSmoothed) {

    //get distance between the two
    let fDist = fActual - fSmoothed;

    //momentum builds in positive direction 
    //(could be still a negative value, but it's heading in a positive direction)
    fMomentum += (fDist / 30000)

    //if actual has reversed, keep going in same direction but lose inertia quickly
    if (fMomentum < 0) { fMomentum /= 1.1 }

    //if getting close to the center (most compact sphere possible)..
    // if (fSmoothed > (fActual * 0.85)) {
      
    //   //fMomentum /= 1.01; //reduce the momentum, ease out of the anim
    // }

    //apply momentum to smoothed value
    fSmoothed += fMomentum

  } else if (fActual < fSmoothed) {

    //get distance between the two
    let fDist = fSmoothed - fActual;

    //if actual is below smoothed, momentum is downwards
    fMomentum -= (fDist / 30000)

    //else if carrying over from previous direction, reduce momentum by div
    if (fMomentum > 0) { fMomentum /= 1.1; }

    //if getting close to the most spread out 
    // if (fSmoothed < (F_ACTUAL_MAX * 0.2)) {
      
    //   //fMomentum /= 1.05; //reduce the momentum, ease out of the anim
    // }
    //apply momentum
    fSmoothed += fMomentum

  }

  if (fSmoothed <= 0) {
    fSmoothed = 0;
    fMomentum = 0;
  } else if (fSmoothed >= F_ACTUAL_MAX) {
    fSmoothed = F_ACTUAL_MAX;
    fMomentum = 0;
  }

  //if value is new, update cloud
  if (fActual != fSmoothed) {
    broadcastFocus(fSmoothed)
  }



  //text color and size
  fill(255);
  textSize(10);

  //battery from device
  text('EEG BATTERY: ' + batteryLevel + "%", 10, 20);

  //values passed in from control panel page
  text('TARGET FREQUENCY: ' + selectedFrequency + ' Hz', 10, 35);
  text('AMPLITUDE THRESHOLD: ' + selectedAmplitude + ' mV', 10, 50);


}



function mouseClicked() {

  //init sounds as muted

  soundAnalog.loop();
  soundAnalog.setVolume(0.0);
  soundBrass.loop();
  soundBrass.setVolume(0.0);
  soundGlass.loop();
  soundGlass.setVolume(0);
  soundStrings.loop();
  soundStrings.setVolume(0.0);

  soundSparkle.loop();
  soundSparkle.setVolume(0.0);

  soundArasian.loop();
  soundArasian.setVolume(0.0);

}

//receiving data from the control panel
function didReceiveRtcData(data, id) {

  // If it is JSON, parse it
  let jsonData = JSON.parse(data);

  console.log("received data from control panel", data, id)

  //slider value changes from control panel
  if (jsonData.type == SLIDER_AMP_ID) {
    selectedAmplitude = jsonData.amp
  } else if (jsonData.type == SLIDER_FREQ_ID) {
    selectedFrequency = jsonData.freq
  }
}

//muse device listeners
//these are called from the muse classes when a value is updated by the device via bluetooth streams
function didUpdateEeg() {
  //console.log("didUpdateEeg:", eeg);
  eeg.type = EEG_ID;
  eeg.spectrum = eegSpectrum;
  p5lm.send(JSON.stringify(eeg));
}
function didUpdatePpg() {
  //console.log("didUpdatePpg:", ppg);
  ppg.type = PPG_ID;
  p5lm.send(JSON.stringify(ppg));
}
function didUpdateAccel() {
  //console.log("didUpdateAccel:", accel);
  //add "type" to current package and send
  accel.type = ACCEL_ID;
  p5lm.send(JSON.stringify(accel));
}
function didUpdateBatteryLevel() {
  //package up into a js object with a "type"
  let batteryData = {
    type: BATTERY_ID,
    batteryLevel: batteryLevel
  }
  p5lm.send(JSON.stringify(batteryData));
}


function broadcastFocus(newFocus) {

  //sound
  let soundArasianVol = map(newFocus, 0, F_ACTUAL_MAX, 0.001, SOUND_ARASIAN_VOL);
  soundArasian.setVolume(soundArasianVol)

  let dist;

  dist = F_ACTUAL_MAX * 0.3
  let soundGlassVol = 0;
  if (newFocus > dist){
    soundGlassVol = map(newFocus, dist, F_ACTUAL_MAX, 0, SOUND_GLASS_VOL);
    soundGlass.setVolume(soundGlassVol)
  }

  dist = F_ACTUAL_MAX * 0.7
  let soundAnalogVol = 0;
  if (newFocus > dist){
    soundAnalogVol = map(newFocus, dist, F_ACTUAL_MAX, 0, SOUND_ANALOG_VOL);
    soundAnalog.setVolume(soundAnalogVol)
  }

  dist = F_ACTUAL_MAX * 0.8
  let soundBrassVol = 0;
  if (newFocus > dist){
    soundBrassVol = map(newFocus, dist, F_ACTUAL_MAX, 0, SOUND_BRASS_VOL);
    soundBrass.setVolume(soundBrassVol)
  }

  dist = F_ACTUAL_MAX * 0.9
  let soundStringsVol = 0;
  if (newFocus > dist){
    soundStringsVol = map(newFocus, dist, F_ACTUAL_MAX, 0, SOUND_STRINGS_VOL);
    soundStrings.setVolume(soundStringsVol)
  }

  let soundSparkleVolume = map(newFocus, 0, F_ACTUAL_MAX, SOUND_SPARKLE_VOL, 0);
  soundSparkle.setVolume(soundSparkleVolume)

  

  //convert high values of a brainwave to a more focused radius
  //invert the volts
  //amplify
  let radius = map(newFocus, F_ACTUAL_MAX, 0, 3, 100);

  //send via a global route
  //to the sphere
  window.updateCloudRadius(radius);
}