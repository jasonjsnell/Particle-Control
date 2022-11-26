let freqSlider;
let ampSlider;

function setup() {

  createCanvas(400, 400);

  freqSlider = createSlider(1, 60, 10);
  freqSlider.position(20, height-50);
  freqSlider.style('width', (width*0.3) + 'px');

  ampSlider = createSlider(0, 60, 10);
  ampSlider.position(width * 0.5, height-50);
  ampSlider.style('width', (width*0.3) + 'px');

  setupMuse();

}

function draw() {

  background(200);

  let selectedFrequency = freqSlider.value();
  let selectedAmplitude = ampSlider.value();

  textSize(10);
  text('BATTERY: ' + batteryLevel, width-80, 10);
  
  textSize(12);
  text('FFT: ' + Math.round(spectrum[selectedFrequency]), 10, 30);

  text('Target frequency: ' + selectedFrequency + ' Hz', 25, height-18);
  text('Target amplitude: ' + selectedAmplitude + ' mV', width * 0.5, height-18);
  

}

