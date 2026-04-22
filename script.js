const input = $("#cmd-input");
const history = $("#logs");

// Command Management
const commands = {
    help: {
        desc: "Show available commands",
        usage: "help [command]",
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
                    let incogWin = window.open("about:blank", "Flint-Incog");
                    if(incogWin){
                        incogWin.document.open();
                        incogWin.document.write(`<head><title>Home | Schoology</title><link rel="icon" type="image/x-icon" href="https://t1.gstatic.com/faviconV2?client=SOCIAL&amp;type=FAVICON&amp;fallback_opts=TYPE,SIZE,URL&amp;url=http://schoology.com&amp;size=64"><head><body><iframe src="${args[0]}" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0; outline: 0;"></iframe></body>`);
                        incogWin.document.close();
                    }
                    return warn("NOTE: using --incog requires the specified website to accept itself to be embedded.");
                }
            }
            window.open(args[0]);
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
            block += `\n${error(`'${cmdName}' is not a recognized command. Run 'help' for a list.`)}\n`;
        } else {
            const output = cmd.run(args);
            if (output !== null) block += `\n${output}\n`;
        }

        history.append(`${block}\n`);
        input.val("");
        window.scrollTo(0, document.body.scrollHeight);
    }
});