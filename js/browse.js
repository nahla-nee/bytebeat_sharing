window.onload = on_load;

let aws_lambda_url = "https://wywmo7jm2f.execute-api.us-east-2.amazonaws.com/beat";

function beatFromTemplate(beat) {
    return `<div class="beat">
        <a href="index.html?id=${encodeURIComponent(beat.id)}">${beat.id}</a>
        <pre>${beat.code}</pre>
    <div>`;
}

function on_load() {
    let shared_beats = document.getElementById("shared_beats");

    fetch(aws_lambda_url, {
        method: "GET",
    }).then(async (data) => {
        let body = await data.json();
        body.forEach((beat) => shared_beats.innerHTML += beatFromTemplate(beat));
    })
    .catch(function() {
        window.alert("Failed to get beats");
    });
}