"use strict"

// data set
function Modification(name, filename) {
    this.name = name
    this.filename = filename
}

var MODIFICATIONS = {
    "0-15-35": new Modification("Vanilla 0.15.35", "vanilla-0.15.35.json"),
    "0-15-35x": new Modification("Vanilla 0.15.35 - Expensive", "vanilla-0.15.35-expensive.json"),
    //"bobs-0-15-35": new Modification("Bob's Mods + base 0.15.35", "bobs-0.15.35.json")
}

var DEFAULT_MODIFICATION = "0-15-35"

function renderDataSetOptions(settings) {
    var modSelector = document.getElementById("data_set")
    for (var modName in MODIFICATIONS) {
        var mod = MODIFICATIONS[modName]
        var option = document.createElement("option")
        option.textContent = mod.name
        option.value = modName
        if (settings.data && settings.data == modName || !settings.data && modName == DEFAULT_MODIFICATION) {
            option.selected = true
        }
        modSelector.appendChild(option)
    }
}

// Returns currently-selected data set.
function currentMod() {
    var elem = document.getElementById("data_set")
    return elem.value
}

// display rate
var seconds = one
var minutes = RationalFromFloat(60)
var hours = RationalFromFloat(3600)

var displayRates = {
    "s": seconds,
    "m": minutes,
    "h": hours,
}
var longRateNames = {
    "s": "second",
    "m": "minute",
    "h": "hour",
}

var DEFAULT_RATE = "m"

var displayRateFactor = displayRates[DEFAULT_RATE]
var rateName = DEFAULT_RATE

function renderRateOptions(settings) {
    if ("rate" in settings) {
        rateName = settings.rate
        displayRateFactor = displayRates[settings.rate]
    }
    var oldNode = document.getElementById("display_rate")
    var cell = oldNode.parentNode
    var node = document.createElement("form")
    node.id = "display_rate"
    for (var name in displayRates) {
        var rate = displayRates[name]
        var input = document.createElement("input")
        input.id = name + "_rate"
        input.type = "radio"
        input.name = "rate"
        input.value = name
        if (rate.equal(displayRateFactor)) {
            input.checked = true
        }
        input.addEventListener("change", displayRateHandler)
        node.appendChild(input)
        var label = document.createElement("label")
        label.htmlFor = name + "_rate"
        label.textContent = "items/" + longRateNames[name]
        node.appendChild(label)
        node.appendChild(document.createElement("br"))
    }
    cell.replaceChild(node, oldNode)
}

// precisions
var DEFAULT_RATE_PRECISION = 3
var ratePrecision = DEFAULT_RATE_PRECISION

var DEFAULT_COUNT_PRECISION = 1
var countPrecision = DEFAULT_COUNT_PRECISION

function renderPrecisions(settings) {
    if ("rp" in settings) {
        ratePrecision = Number(settings.rp)
        document.getElementById("rprec").value = ratePrecision
    }
    if ("cp" in settings) {
        countPrecision = Number(settings.cp)
        document.getElementById("fprec").value = countPrecision
    }
}

// minimum assembler
var DEFAULT_MINIMUM = "1"

var minimumAssembler = DEFAULT_MINIMUM

function renderMinimumAssembler(settings) {
    var min = DEFAULT_MINIMUM
    // Backward compatibility.
    if ("use_3" in settings && settings.use_3 == "true") {
        min = "3"
    }
    var assemblers = spec.factories["crafting"]
    if ("min" in settings && Number(min) >= 1 && Number(min) <= assemblers.length) {
        min = settings.min
    }
    setMinimumAssembler(min)
    var oldNode = document.getElementById("minimum_assembler")
    var cell = oldNode.parentNode
    var node = document.createElement("span")
    node.id = "minimum_assembler"
    var dropdown = new Dropdown(node, "assembler_dropdown", changeMin)
    for (var i = 0; i < assemblers.length; i++) {
        var assembler = assemblers[i]
        var image = getImage(assembler)
        dropdown.add(image, String(i + 1), String(i + 1) === min)
    }
    cell.replaceChild(node, oldNode)
}

function setMinimumAssembler(min) {
    spec.setMinimum(min)
    minimumAssembler = min
}

// furnace
function renderFurnace(settings) {
    var furnace = spec.furnace
    if ("furnace" in settings) {
        furnace = settings.furnace
        spec.setFurnace(furnace.name)
    }
    var oldNode = document.getElementById("furnace")
    var cell = oldNode.parentNode
    var node = document.createElement("span")
    node.id = "furnace"
    var dropdown = new Dropdown(node, "furnace_dropdown", changeFurnace)
    var furnaces = spec.factories["smelting"]
    for (var i = 0; i < furnaces.length; i++) {
        var f = furnaces[i]
        var image = getImage(f)
        dropdown.add(image, f.name, f.name === furnace.name)
    }
    cell.replaceChild(node, oldNode)
}

// belt
function Belt(name, speed) {
    this.name = name
    this.speed = RationalFromFloats(speed, 60)
}

// XXX: Should derive this from the game data. Mods may add new belt types.
var BELTS = [
    new Belt("transport-belt", 800),
    new Belt("fast-transport-belt", 1600),
    new Belt("express-transport-belt", 2400)
]

var DEFAULT_BELT = "transport-belt"

var preferredBelt = DEFAULT_BELT
var preferredBeltSpeed = null

function renderBelt(settings) {
    var pref = DEFAULT_BELT
    if ("belt" in settings) {
        pref = settings.belt
    }
    setPreferredBelt(pref)
    var oldNode = document.getElementById("belt")
    var cell = oldNode.parentNode
    var node = document.createElement("span")
    node.id = "belt"
    var dropdown = new Dropdown(node, "belt_dropdown", changeBelt)
    for (var i = 0; i < BELTS.length; i++) {
        var belt = BELTS[i]
        var image = getImage(solver.items[belt.name])
        dropdown.add(image, belt.name, belt.name === preferredBelt)
    }
    cell.replaceChild(node, oldNode)
}

function setPreferredBelt(name) {
    for (var i = 0; i < BELTS.length; i++) {
        var belt = BELTS[i]
        if (belt.name === name) {
            preferredBelt = name
            preferredBeltSpeed = belt.speed
        }
    }
}

// pipe
var DEFAULT_PIPE = RationalFromFloat(17)

var minPipeLength = DEFAULT_PIPE
var maxPipeThroughput = null

function renderPipe(settings) {
    var pipe = DEFAULT_PIPE.toDecimal(0)
    if ("pipe" in settings) {
        pipe = settings.pipe
    }
    setMinPipe(pipe)
    document.getElementById("pipe_length").value = minPipeLength.toDecimal(0)
}

function setMinPipe(lengthString) {
    minPipeLength = RationalFromString(lengthString)
    maxPipeThroughput = pipeThroughput(minPipeLength)
}

// mining productivity bonus
function renderMiningProd(settings) {
    if ("mprod" in settings) {
        var mprod = document.getElementById("mprod")
        mprod.value = settings.mprod
    }
    spec.miningProd = getMprod()
}

function getMprod() {
    var mprod = document.getElementById("mprod").value
    return RationalFromFloats(Number(mprod), 100)
}

// value format
var DEFAULT_FORMAT = "decimal"

var displayFormat = DEFAULT_FORMAT

var displayFormats = {
    "d": "decimal",
    "r": "rational"
}

function renderValueFormat(settings) {
    if ("vf" in settings) {
        displayFormat = displayFormats[settings.vf]
        var input = document.getElementById(displayFormat + "_format")
        input.checked = true
    }
}

// all
function renderSettings(settings) {
    renderRateOptions(settings)
    renderPrecisions(settings)
    renderMinimumAssembler(settings)
    renderFurnace(settings)
    renderBelt(settings)
    renderPipe(settings)
    renderMiningProd(settings)
    renderValueFormat(settings)
}
