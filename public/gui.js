import { updateTrails } from "./sphereThree.js";
import { updateBrightness } from "./sphereThree.js";
import { updateGlow } from "./sphereThree.js";
const pane = new Tweakpane.Pane();

const PARAMS = {
    bright: 1.53,
    glow: 0.79,
    trails: 0.87,
};

pane.addInput(
    PARAMS, 'bright',
    { min: 0, max: 10.0, step: 0.01 }
).on('change', (ev) => {
    console.log(ev.value.toFixed(2));
    updateBrightness(ev.value.toFixed(2));
});

pane.addInput(
    PARAMS, 'glow',
    { min: 0, max:10.0, step: 0.01 }
).on('change', (ev) => {
    console.log(ev.value.toFixed(2));
    updateGlow(1.0-ev.value.toFixed(2));
});

pane.addInput(
    PARAMS, 'trails',
    { min: 0, max: 1.0, step: 0.01 }
).on('change', (ev) => {
    console.log(ev.value.toFixed(2));
    updateTrails(ev.value.toFixed(2));
});