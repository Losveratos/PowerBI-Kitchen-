"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import Card = formattingSettings.SimpleCard;
import Model = formattingSettings.Model;

/**
 * Animations-Karte: Explosion, Tempo, Rotation an/aus, Wackeln.
 */
class AnimationCard extends Card {
    explosion = new formattingSettings.Slider({
        name: "explosion",
        displayName: "Explosion",
        value: 1.1,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 2.6 }
        }
    });

    spinSpeed = new formattingSettings.Slider({
        name: "spinSpeed",
        displayName: "Dreh-Tempo",
        value: 0.5,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 1.4 }
        }
    });

    spinning = new formattingSettings.ToggleSwitch({
        name: "spinning",
        displayName: "Dreht sich",
        value: true
    });

    wobble = new formattingSettings.ToggleSwitch({
        name: "wobble",
        displayName: "Wackeln & Schweben",
        value: true
    });

    name: string = "animation";
    displayName: string = "Animation";
    slices: formattingSettings.Slice[] = [this.explosion, this.spinSpeed, this.spinning, this.wobble];
}

/**
 * Style-Karte: Comic-Deko-Elemente ein-/ausschalten.
 */
class StyleCard extends Card {
    showEyes = new formattingSettings.ToggleSwitch({
        name: "showEyes",
        displayName: "Kulleraugen",
        value: true
    });

    showBursts = new formattingSettings.ToggleSwitch({
        name: "showBursts",
        displayName: "Comic-Bursts (POW! BOOM!)",
        value: true
    });

    showLabels = new formattingSettings.ToggleSwitch({
        name: "showLabels",
        displayName: "Sprechblasen-Labels",
        value: true
    });

    outline = new formattingSettings.ToggleSwitch({
        name: "outline",
        displayName: "Schwarze Comic-Kontur",
        value: true
    });

    name: string = "style";
    displayName: string = "Comic-Style";
    slices: formattingSettings.Slice[] = [this.showEyes, this.showBursts, this.showLabels, this.outline];
}

/**
 * Farben-Karte: wird zur Laufzeit mit einem Farbwähler pro Kategorie befüllt.
 */
export class DataColorsCard extends Card {
    name: string = "dataPoint";
    displayName: string = "Farben";
    slices: formattingSettings.Slice[] = [];
}

/**
 * Wurzel-Modell für den Formatierungsbereich.
 */
export class VisualSettings extends Model {
    animation = new AnimationCard();
    style = new StyleCard();
    dataColors = new DataColorsCard();

    cards = [this.animation, this.style, this.dataColors];
}
