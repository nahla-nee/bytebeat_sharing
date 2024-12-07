window.onload = on_load;

let player_state = null;

function on_load() {
    const create_processor = async () => {
        let gain_node = player_state.audio_ctx.createGain();
        gain_node.connect(player_state.audio_ctx.destination);

        await player_state.audio_ctx.audioWorklet.addModule("js/audio_processor.js");
        let audio_worklet_node = new AudioWorkletNode(player_state.audio_ctx, 'audio-processor');
        audio_worklet_node.connect(player_state.audio_ctx.destination);

        player_state.gain_node = {};
        player_state.audio_processor_node = audio_worklet_node;

        player_mode_change();
        volume_change();
    };

    player_state = {
        audio_ctx: new AudioContext({ latencyHint: "balanced", sampleRate: 8000 }),
        needs_processor_update: true
    };

    // default settings and beat
    document.getElementById("editor").value = "((t>>4)+(t>>5|t>>8|t&120))";
    document.getElementById("volume-slider").value = 0.5;
    document.getElementById("player-mode").value = "bytebeat";
    document.getElementById("player-sample-rate").value = 8000;
    document.getElementById("theme").value = "dark";

    create_processor();

    document.getElementById("editor").onchange = () => {
        player_state.needs_processor_update = true;
    };
    document.getElementById("stop-audio").onclick = () => { player_state.audio_ctx.suspend() };
    document.getElementById("playback-toggle").onclick = playback_toggle;
    document.getElementById("player-mode").onchange = player_mode_change;
    document.getElementById("player-sample-rate").onchange = sample_rate_change;
    document.getElementById("volume-slider").onchange = volume_change;
    document.getElementById("theme").onchange = theme_changed;
}

function playback_toggle() {
    if (player_state.needs_processor_update) {
        player_state.audio_processor_node.port.postMessage({
            command: "set_function",
            data: document.getElementById("editor").value
        });
        player_state.needs_processor_update = false;
    }

    if (player_state.audio_ctx.state === "running") {
        player_state.audio_ctx.suspend();
    }
    else {
        player_state.audio_ctx.resume();
    }
}

function player_mode_change() {
    player_state.audio_processor_node.port.postMessage({
        command: "set_mode",
        data: document.getElementById("player-mode").value
    });
}

function sample_rate_change(new_rate) {
    player_state.sample_rate = Number(document.getElementById("player-sample-rate").value);
}

function volume_change() {
    let audio_val = parseFloat(document.getElementById("volume-slider").value);
    player_state.gain_node.gain_value = audio_val;
}

function theme_changed() {
    const root = document.querySelector(":root");

    switch (document.getElementById("theme").value) {
        case "dark":
            root.style.setProperty("--bg-color", "black");
            root.style.setProperty("--text-color", "white");
            break;
        case "light":
            root.style.setProperty("--bg-color", "white");
            root.style.setProperty("--text-color", "black");
            break;
    }
}