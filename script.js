const input = $("#cmd-input");
const history = $("#logs");
const fvim = $("#fvim");

var focusToggle = true;

var commandHistory = [];
var selectedCommandHistory = 0;

// Theme Managing
var currentTheme = "default"
if (localStorage.getItem("fcli-theme") !== undefined){ currentTheme = localStorage.getItem("fcli-theme")} else {localStorage.setItem("fcli-theme", currentTheme)}
const themes = {
    "default": {
        "--default-text": "#eeeeee",
        "--info-text": "#6ea3c7",
        "--error-text": "#c76e6e",
        "--warn-text": "#b4c76e",
        "--success-text": "#75c76e",
        "--other-text": "#6ec7c2",
        "--muted-text": "#6e6e78",
        "--accent-text": "#c76eb4",
        "--debug-text": "#9a9aa8",
        "--main-bg": "#14141a",
        "--fvim-bg": "#14141a"
    },
    "nebula": {
        "--default-text": "#ede6f7",
        "--info-text": "#9d7bd8",
        "--error-text": "#e35a8f",
        "--warn-text": "#d8a34d",
        "--success-text": "#7bd8c0",
        "--other-text": "#c77bd8",
        "--muted-text": "#7a6f94",
        "--accent-text": "#e35ac9",
        "--debug-text": "#a89bc2",
        "--main-bg": "#120a1f",
        "--fvim-bg": "#120a1f"
    },
    "sapphire": {
        "--default-text": "#e4edf7",
        "--info-text": "#4d9fe8",
        "--error-text": "#e86464",
        "--warn-text": "#e8b64d",
        "--success-text": "#4de8b0",
        "--other-text": "#7ab8f0",
        "--muted-text": "#5c7590",
        "--accent-text": "#a04de8",
        "--debug-text": "#8ba3bd",
        "--main-bg": "#081428",
        "--fvim-bg": "#081428"
    },
    "light": {
        "--default-text": "#1c1f26",
        "--info-text": "#1d5f8a",
        "--error-text": "#a3312f",
        "--warn-text": "#8a6a1d",
        "--success-text": "#1f7a4d",
        "--other-text": "#1d7a7a",
        "--muted-text": "#767b85",
        "--accent-text": "#8a1d6a",
        "--debug-text": "#5c6270",
        "--main-bg": "#eef0f4",
        "--fvim-bg": "#eef0f4"
    },
    "emerald": {
        "--default-text": "#e3f2e9",
        "--info-text": "#4d9ebd",
        "--error-text": "#d8615a",
        "--warn-text": "#d8b04d",
        "--success-text": "#4dd88a",
        "--other-text": "#7bd8b0",
        "--muted-text": "#5c8a70",
        "--accent-text": "#d84dbb",
        "--debug-text": "#8fb5a0",
        "--main-bg": "#08150f",
        "--fvim-bg": "#08150f"
    }
};

function applyTheme(key) {
    const theme = themes[key];
    if (!theme) return false;
    const root = document.documentElement;
    Object.entries(theme).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
    });
    return true;
}
applyTheme(currentTheme);


// Command Management
const commands = {
    cmds: {
        desc: "Show available commands",
        usage: "cmds [command]",
        run(args) {
            if (args[0]) {
                const cmd = commands[args[0]];
                if (!cmd) return error(`Unknown command: ${args[0]}`);
                return `${args[0]} - ${cmd.desc}\nUsage: ${cmd.usage}`;
            }
            return Object.entries(commands)
                .map(([name, cmd]) => `  ${name.padEnd(12)} ${cmd.desc}`)
                .join("\n");
        }
    },
    echo: {
        desc: "Print text to the terminal",
        usage: "echo <text>",
        run(args) {
            if (!args.length) return error("Usage: echo <text>");
            return args.join(" ");
        }
    },
    clear: {
        desc: "Clear the terminal",
        usage: "clear",
        run() {
            history.text("");
            return null; // null = no output
        }
    },
    open: {
        desc: "Opens a URL.",
        usage: "open <url> <flag?>",
        run(args) {
            if (!args.length) return error(`Usage: open <url> <flag?>\n\n`) + info("Optional Flags:\n --incog - open link via about:blank");
            if (args[1]) {
                const flag = args[1];
                if(flag == "--incog"){
                    let incogWin = window.open("about:blank", "_blank");
                    const incognitoSites = [
                        { name: "Home - Classroom", icon: "https://ssl.gstatic.com/classroom/favicon.png" },
                        { name: "Google", icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://google.com&size=64" },
                        { name: "Gmail", icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://mail.google.com&size=64" },
                        { name: "Canvas", icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://instructure.com&size=64" },
                    ];

                    const disguise = incognitoSites[Math.floor(Math.random() * incognitoSites.length)];
                    if(incogWin){
                        incogWin.document.open();
                        incogWin.document.write(`<!DOCTYPE html><html><head><title>${disguise.name}</title></head><body><iframe src="${args[0]}" style="top:0;left:0;width:100%;height:100%;position:absolute;border:0;outline:0;"></iframe></body></html>`);
                        incogWin.document.close();

                        const link = incogWin.document.createElement('link');
                        link.rel = 'icon';
                        link.type = 'image/png';
                        link.href = disguise.icon;
                        incogWin.document.head.appendChild(link);
                    }
                    return warn("NOTE: using --incog requires the specified website to accept itself to be embedded.");
                }
            }
            window.open(args[0]);
            return null; // null = no output
        }
    },
    fvim: {
        desc: "Opens the Flint CLI Text Editor.",
        usage: "fvim",
        run() {
            openfvim();
            return null; // null = no output
        }
    },
    theme: {
        desc: "Change the Flint CLI Terminal Theme",
        usage: "theme <themeName / flag?>",
        run(args){
            if (!args.length) return error(`Usage: theme <themeName / flag?>\n\n`) + info("Optional Flags:\n --l - List out all available themes.");
            if(args[0]){
                const userInput = args[0];

                const availableThemes = Object.keys(themes);

                if(userInput == "--l"){
                    const list = availableThemes
                    .map(t => t === currentTheme ? `${success("✓")} ${t}` : `  ${t}`)
                    .join("\n");
                    return info("List of themes:\n\n") + list;
                } else {
                    const match = availableThemes.find(t => t.toLowerCase() === userInput.toLowerCase());
                    if(match){
                        applyTheme(match.toLowerCase());
                        currentTheme = match;
                        localStorage.setItem("fcli-theme", match);
                        return success(`Theme switched to '${match}'.`);
                    } else {
                        return error("Error: Theme '" + userInput + "' doesn't exist. Use --l to view a list of available themes.");
                    }
                }
            }
        }
    },
    sysinfo: {
        desc: "Display system and browser information",
        usage: "sysinfo",
        async run() {
            const nav = navigator;
            const scr = screen;

            const lines = [];
            lines.push(other("┌─ SYSTEM ─────────────────────────"));
            lines.push(`${info("Platform:")}    ${nav.platform || "Unknown"}`);
            lines.push(`${info("Cores:")}       ${nav.hardwareConcurrency || "?"}`);
            if (nav.deviceMemory) lines.push(`${info("Memory:")}      ~${nav.deviceMemory} GB`);
            lines.push(`${info("Language:")}    ${nav.language}`);
            lines.push(other("├─ DISPLAY ────────────────────────"));
            lines.push(`${info("Resolution:")}  ${scr.width}x${scr.height}`);
            lines.push(`${info("Color Depth:")} ${scr.colorDepth}-bit`);
            lines.push(`${info("Pixel Ratio:")} ${window.devicePixelRatio}`);
            lines.push(other("├─ NETWORK ────────────────────────"));
            lines.push(`${info("Status:")}      ${nav.onLine ? success("Online") : error("Offline")}`);
            if (nav.connection) {
                lines.push(`${info("Type:")}        ${nav.connection.effectiveType || "?"}`);
                if (nav.connection.downlink) lines.push(`${info("Downlink:")}    ~${nav.connection.downlink} Mbps`);
            }

            if (nav.getBattery) {
                try {
                    const battery = await nav.getBattery();
                    lines.push(other("├─ BATTERY ────────────────────────"));
                    lines.push(`${info("Charge:")}      ${Math.round(battery.level * 100)}%`);
                    lines.push(`${info("Charging:")}    ${battery.charging ? success("Yes") : warn("No")}`);
                } catch (e) { /* battery API blocked, skip silently */ }
            }

            lines.push(other("└──────────────────────────────────"));
            return lines.join("\n");
        }
    },
    eval: {
        desc: "Run JavaScript code on the Flint CLI app",
        usage: "eval <code>",
        run(args){
            if (!args.length) return error(`Usage: eval <javascript code>`);
            if(args[0]){
                eval(args[0]);
            }
            return null;
        }
    },
    themetext: {
        desc: success("Theme text testing"),
        usage: "themetext",
        run(){
            return success("Success text\n") + error("Error text\n") + info("Info text\n") + other("Other text\n") + muted("Muted text\n") + accent("Accent text\n") + debug("Debug text\n") + warn("Warn text")
        }
    }
};

function error(msg) {
    return `<span class="error-text">${msg}</span>`;
}

function warn(msg) {
    return `<span class="warn-text">${msg}</span>`;
}

function info(msg) {
    return `<span class="info-text">${msg}</span>`;
}

function success(msg) {
    return `<span class="success-text">${msg}</span>`;
}

function other(msg) {
    return `<span class="other-text">${msg}</span>`;
}

function muted(msg) {
    return `<span class="muted-text">${msg}</span>`;
}

function accent(msg) {
    return `<span class="accent-text">${msg}</span>`;
}

function debug(msg) {
    return `<span class="debug-text">${msg}</span>`;
}

input.on('keydown', async function(e) {
    if (e.key === "Enter") {
        const fullCommand = input.val().trim();
        if (!fullCommand) return;

        const parts = fullCommand.split(/\s+/);
        const cmdName = parts[0].toLowerCase();
        const args = parts.slice(1);
        const cmd = commands[cmdName];

        let block = `C:\\Flint\\admin> ${fullCommand}`;
        commandHistory.push(fullCommand);
        selectedCommandHistory = 0;
        input.val(""); // clear input immediately so it doesn't feel laggy while awaiting

        if (!cmd) {
            block += `\n${error(`'${cmdName}' is not a recognized command. Run 'cmds' for a list.`)}\n`;
        } else {
            const output = await cmd.run(args);
            if (output !== null) block += `\n${output}\n`;
        }

        history.append(`${block}\n`);
        window.scrollTo(0, document.body.scrollHeight);
    }
    if (e.key === "ArrowUp"){
        e.preventDefault();
        if(commandHistory.length != 0 && selectedCommandHistory != commandHistory.length){
            selectedCommandHistory += 1;
            const val = commandHistory[commandHistory.length - selectedCommandHistory];
            input.val(val);
            const el = input[0];
            el.setSelectionRange(val.length, val.length);
        }
    }
    if (e.key === "ArrowDown"){
        if(selectedCommandHistory > 1){
            selectedCommandHistory -= 1;
            const val = commandHistory[commandHistory.length - selectedCommandHistory];
            input.val(val);
            const el = input[0];
            el.setSelectionRange(val.length, val.length);
        } else if (selectedCommandHistory === 1) {
            selectedCommandHistory = 0;
            input.val("");
        }
    }
});

function focusTerminal(){
    if (focusToggle) document.getElementById('cmd-input').focus();
}

/* Fvim Functionality */
function openfvim(){
    fvim.css("display", "flex");
    $('body').css('cursor', 'none');
    focusToggle = false;
    setTimeout(function(){
        document.getElementById('fvim-textarea').focus();
    }, 100)
}

function closefvim(){
    fvim.css('display', 'none');
    $('body').css('cursor', 'default');
    focusToggle = true;
    setTimeout(function(){
        document.getElementById('cmd-input').focus();
    }, 100)
}

// Allow tabbing in Fvim
$("#fvim-textarea").on('keydown', function(event){
    if (event.keyCode === 9) {
        event.preventDefault(); // Prevent the default tab behavior
        const el = this;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const $this = $(el);
        const value = $this.val();

        // Set the new value: text before + tab + text after
        $this.val(value.substring(0, start) + "\t" + value.substring(end));

        // Put the cursor back in the right place
        el.selectionStart = el.selectionEnd = start + 1;
    }
});

$("#fvim-textarea").on('keydown', function(e) {
    if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        closefvim();
    }
});