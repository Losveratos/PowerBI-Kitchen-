# Is AI the New Paper — and Markdown the New Pen?

> Markdown version of [prototyping-pnl-treiberbaum_en.html](../prototyping-pnl-treiberbaum_en.html) · https://datenwgknowledgekitchen.com/prototyping-pnl-treiberbaum_en.html · generated with scripts/build_md.py — if the two differ, the HTML version prevails.

Post · Prototyping & AI

Is classical pen-and-paper prototyping about to die for many reports, dashboards and business applications? My goal was a **P&L prototype I can pitch to an international organisation in the producing sector** — multilingual, with simulation, with regional colour conventions. Instead of sketches on paper: one Markdown file with the specs, three Claude tools, and in the end a clickable prototype plus a demo video.

By **Michael Tenner** · As of · **August 2026** · Tools · **Claude Desktop · Claude Design · Claude Code** · Result · **Interactive prototype + MP4**

**Demo video:** ../assets/pnl-treiberbaum-demo.mp4

**Poster frame:** ../assets/pnl-treiberbaum-poster.png

**A 47-second walkthrough of the prototype:** driver tree with drilldown to quantity × price, EBIT bridge, five analysis views, driver simulation with a target-margin solver — and the language switch EN → ZH → JA → AR → DE incl. right-to-left layout and East Asian colour semantics.

## The approach: *three steps*, not a single line of code typed

Sure, you can still provide drawings. But by now, in 2026, it is often not even necessary. The complete path from idea to clickable prototype ran through three stations:

### 1 · Specs as Markdown — Claude Desktop

One MD file describes what the prototype has to do: **multilingual** (incl. Arabic with right-to-left reading order), **driver simulation** with scenarios, and **colours according to the region** — in China, red is the colour of good development, so the prototype flips the colour logic there. Markdown is the new pen: precise enough for the machine, readable enough for humans.

### 2 · Generate the HTML interface — Claude Opus · Claude Design

The specs become the interface: driver tree, EBIT bridge, KPI strip, month navigation, simulation sliders — as one single HTML file that runs offline. Not a mockup that pretends: **every number actually calculates**, with volume and price effects reported separately per line.

### 3 · Review, polish & demo clip — Claude Code · Fable 5 (high)

A code review of the prototype, then the add-ons: an **auto tour** that presents the dashboard on its own, hotkeys for the views, smoother transitions, the switch for the breakdowns — and finally Fable recorded the **MP4 demo clip** itself: launched a headless browser, scripted the tour, cut the video.

7 languages — **A prototype that takes the target organisation seriously:** DE, EN, JA, ZH, ES, FR, AR — with right-to-left layout for the Arabic world and flipped colour semantics for China. Exactly the details you could never prototype on paper.

## Do we have to *rethink prototyping?*

The classical paper prototype answers the question: "Do we agree on the layout?" The AI-generated prototype additionally answers: **"Does it feel right when you click it?"** — with real numbers, real interaction, real multilingualism. And it was built fast enough that you can throw it away after the first feedback session and regenerate it without pain. That was always the real promise of paper.

What remains: the specification moves to the front. If you can describe precisely what is needed — functionally, culturally, professionally — you now get in hours what used to cost weeks of mockup iterations. The thinking is not replaced; it becomes visible.

> ### Try it yourself
>
> The prototype runs entirely in the browser — a single HTML file, no installation, no data leaves your machine. Sample data of a fictional series manufacturer (Nordwerk Antriebstechnik AG). Tip: click **▶ Auto demo** in the top right and watch — or jump through the views with keys 1–5.

Interactive · 16:9 full screen

### Play with the live demo

Expand the driver tree, filter the bridge, push the scenarios, let the solver do the maths — and switch the language.

[Open the demo →](../pnl-treiberbaum-demo.html)

## The LinkedIn post *to take away*

The short version as posted on LinkedIn:

### LinkedIn post · Original (EN)

```
Is classical pen-and-paper prototyping about to die for many reports/dashboards and business applications?

Is AI the new paper, and Markdown files the new pen? Sure, you can also provide drawings, but often, by now, in 2026, it is not even necessary.

My goal was a P&L I can pitch for an international organisation in the producing sector.

First, I created with Claude Desktop an MD file with the specs, e.g.
Multilingual, Simulation, Colours according to the region (you can see this for China — red is the colour for good development — and the reading order for the Arabic World)

Second, I used Claude Opus in Claude Design for creating the HTML interface.

Lastly, I reviewed the HTML in Claude Code with Fable 5 on high, had some addons like the auto tour and the switch for the breakdowns, and I let Fable create an MP4 demo clip.

Do you think we have to rethink prototyping?

I will provide the link to the interactive version in the comments ;-) Feel free to play.

#Claude #prototyping #Dashboard #Finance #Report
```

Questions, criticism, your own experiments: **Michael Tenner** · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

The prototype shows sample data of a fictional company. Tools: Claude Desktop (specs), Claude Design with Opus (interface), Claude Code with Fable 5 (review, add-ons, demo video).

---

## Read on

- HTML (authoritative): https://datenwgknowledgekitchen.com/prototyping-pnl-treiberbaum_en.html
- German version: [prototyping-pnl-treiberbaum.html](../prototyping-pnl-treiberbaum.html) · [prototyping-pnl-treiberbaum.md](prototyping-pnl-treiberbaum.md)
- Interactive demo: [pnl-treiberbaum-demo.html](../pnl-treiberbaum-demo.html) · https://datenwgknowledgekitchen.com/pnl-treiberbaum-demo.html
