const input = $("#cmd-input");
const history = $("#logs");
const fvim = $("#fvim");

var focusToggle = true;

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
                        { name: "Home | Schoology", icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://schoology.com&size=64" },
                        { name: "Google", icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://google.com&size=64" },
                        { name: "Gmail", icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://gmail.com&size=64" },
                        { name: "YouTube", icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://youtube.com&size=64" },
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
        usage: "fivm",
        run() {
            openfvim();
            return null; // null = no output
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

input.on('keydown', function(e) {
    if (e.key === "Enter") {
        const fullCommand = input.val().trim();
        if (!fullCommand) return;

        const parts = fullCommand.split(/\s+/);
        const cmdName = parts[0].toLowerCase();
        const args = parts.slice(1);
        const cmd = commands[cmdName];

        let block = `C:\\Flint\\admin> ${fullCommand}`;

        if (!cmd) {
            block += `\n${error(`'${cmdName}' is not a recognized command. Run 'cmds' for a list.`)}\n`;
        } else {
            const output = cmd.run(args);
            if (output !== null) block += `\n${output}\n`;
        }

        history.append(`${block}\n`);
        input.val("");
        window.scrollTo(0, document.body.scrollHeight);
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