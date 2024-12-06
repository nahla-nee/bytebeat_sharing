class AudioProcessor extends AudioWorkletProcessor {
    constructor(...args) {
        super(...args);
        this.mode = "bytebeat";
        this.transformer = null;
        this.user_function = null;
        this.port.onmessage = this.receive_message.bind(this);
        this.set_mode("bytebeat");
    }

    process (_, [ output ]) {
        
        for (let i = 0; i < 128; i += 1) {
            const t = currentFrame + i;

            output[0][i] = this.transformer(this.user_function(t));
        }

        return true;
    }

    receive_message(message) {
        message = message.data;
        switch (message.command){
            case "set_mode":
                this.set_mode(message.data);
                break;
            case "set_function":
                this.user_function = new Function("t", `return ${message.data};`);
                break;
        }
    }

    set_mode(mode) {
        switch (mode) {
            case "bytebeat":
                this.transformer = (value) => { return (value & 255) / 127.5 - 1; }
                this.mode = "bytebeat"
                break;
            case "signed_bytebeat":
                this.transformer = (value) => { return ((value + 128) & 255) / 127.5 - 1; }
                this.mode = "signed_bytebeat"
                break;
            case "floatbeat":
                this.transformer = (value) => {return value; };
                this.mode = "floatbeat"
                break;
        }
    }
}

registerProcessor("audio-processor", AudioProcessor);