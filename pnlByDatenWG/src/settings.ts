"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;

const referenceItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto (PL, else PY)" },
    { value: "py", displayName: "Previous Year (PY)" },
    { value: "pl", displayName: "Plan (PL)" },
    { value: "fc", displayName: "Forecast (FC)" }
];

const scalingItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "none", displayName: "None" },
    { value: "k", displayName: "Thousands (k)" },
    { value: "m", displayName: "Millions (m)" }
];

export class ColumnsCardSettings extends FormattingSettingsCard {
    reference = new formattingSettings.ItemDropdown({
        name: "reference",
        displayName: "Reference scenario (Δ against)",
        displayNameKey: "Columns_Reference",
        items: referenceItems,
        value: referenceItems[0]
    });

    showReferenceCol = new formattingSettings.ToggleSwitch({
        name: "showReferenceCol",
        displayName: "Reference value column",
        displayNameKey: "Columns_ShowRef",
        value: true
    });

    showDeltaBar = new formattingSettings.ToggleSwitch({
        name: "showDeltaBar",
        displayName: "Δ bar column (absolute)",
        displayNameKey: "Columns_DeltaBar",
        value: true
    });

    showDeltaPct = new formattingSettings.ToggleSwitch({
        name: "showDeltaPct",
        displayName: "Δ% pin column",
        displayNameKey: "Columns_DeltaPct",
        value: true
    });

    showSecondDelta = new formattingSettings.ToggleSwitch({
        name: "showSecondDelta",
        displayName: "Second Δ% (other reference)",
        displayNameKey: "Columns_SecondDelta",
        description: "Shows ΔPY% and ΔPL% side by side when both references exist",
        value: false
    });

    name: string = "columns";
    displayName: string = "Columns";
    displayNameKey: string = "Card_Columns";
    slices = [this.reference, this.showReferenceCol, this.showDeltaBar, this.showDeltaPct, this.showSecondDelta];
}

export class NumbersCardSettings extends FormattingSettingsCard {
    scaling = new formattingSettings.ItemDropdown({
        name: "scaling",
        displayName: "Scaling",
        displayNameKey: "Numbers_Scaling",
        items: scalingItems,
        value: scalingItems[0]
    });

    decimals = new formattingSettings.NumUpDown({
        name: "decimals",
        displayName: "Decimals (values)",
        displayNameKey: "Numbers_Decimals",
        value: 1,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 3 }
        }
    });

    pctDecimals = new formattingSettings.NumUpDown({
        name: "pctDecimals",
        displayName: "Decimals (Δ%)",
        displayNameKey: "Numbers_PctDecimals",
        value: 1,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 2 }
        }
    });

    name: string = "numbers";
    displayName: string = "Numbers";
    displayNameKey: string = "Card_Numbers";
    slices = [this.scaling, this.decimals, this.pctDecimals];
}

export class TitleBlockCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show title block",
        displayNameKey: "Title_Show",
        value: true
    });

    unitLine = new formattingSettings.TextInput({
        name: "unitLine",
        displayName: "Line 1 · unit / entity",
        displayNameKey: "Title_Unit",
        placeholder: "e.g. Contoso Group",
        value: ""
    });

    measureLine = new formattingSettings.TextInput({
        name: "measureLine",
        displayName: "Line 2 · measure + unit",
        displayNameKey: "Title_Measure",
        placeholder: "e.g. P&L in kEUR",
        value: ""
    });

    periodLine = new formattingSettings.TextInput({
        name: "periodLine",
        displayName: "Line 3 · period + scenarios",
        displayNameKey: "Title_Period",
        placeholder: "e.g. Jan..Jun 2026 AC, PL, ΔPL",
        value: ""
    });

    message = new formattingSettings.TextInput({
        name: "message",
        displayName: "Message line (interpretation)",
        displayNameKey: "Title_Message",
        placeholder: "e.g. EBITDA 8 % below plan, driven by opex",
        value: ""
    });

    name: string = "titleBlock";
    displayName: string = "Title block";
    displayNameKey: string = "Card_Title";
    slices = [this.show, this.unitLine, this.measureLine, this.periodLine, this.message];
}

export class HierarchyCardSettings extends FormattingSettingsCard {
    defaultLevel = new formattingSettings.NumUpDown({
        name: "defaultLevel",
        displayName: "Default expand level",
        displayNameKey: "Hierarchy_DefaultLevel",
        description: "0 = expand everything",
        value: 2,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 8 }
        }
    });

    indent = new formattingSettings.NumUpDown({
        name: "indent",
        displayName: "Indent per level (px)",
        displayNameKey: "Hierarchy_Indent",
        value: 14,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 6 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 32 }
        }
    });

    showLevelButtons = new formattingSettings.ToggleSwitch({
        name: "showLevelButtons",
        displayName: "Level buttons (1·2·3·all)",
        displayNameKey: "Hierarchy_LevelButtons",
        value: true
    });

    name: string = "hierarchy";
    displayName: string = "Hierarchy";
    displayNameKey: string = "Card_Hierarchy";
    slices = [this.defaultLevel, this.indent, this.showLevelButtons];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    columnsCard = new ColumnsCardSettings();
    numbersCard = new NumbersCardSettings();
    titleCard = new TitleBlockCardSettings();
    hierarchyCard = new HierarchyCardSettings();

    cards = [this.columnsCard, this.numbersCard, this.titleCard, this.hierarchyCard];
}
