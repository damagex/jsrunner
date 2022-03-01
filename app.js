import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { v4 } from "uuid";

const router = express.Router();
const app = express();
let logs = []
let prev = "";
let changeConsole = ["log", "info", "warn", "error", "fatal", "timeEnd", "timeLog", "timeStamp", "table", "dir", "dirxml", "system"];
const defConsole = {};
const switchConsole = () => {
    changeConsole.forEach(mode => {
        defConsole[mode] = console[mode];
        console[mode] = function () {
            let args = Array.from(arguments);
            if (!mode.includes("time") && !mode.includes("table")) {
                if (prev === "time" && mode === "log") {
                    args[0] = "Timer: " + args[0]
                    args.shift();
                }
                logs.push({
                    mode: mode,
                    args: args
                });
            }
            prev = mode;
            mode = mode === "fatal" ? "error" : mode;
            defConsole[mode].apply(console, args);
        }
    })
}

const revertConsole = () => {
    changeConsole.forEach(con => {
        console[con] = defConsole[con];
    })
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const exec = (run) => (`
    let logs = [];
    const defConsole = {};
    let prev = "";
    let changeConsole = [${changeConsole.map(i => "'" + i + "'")}];
    const switchConsole = ${switchConsole};
    switchConsole();
    try {
        ${run}
    } catch (err) {
        console.error(JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))))
    }
    const revertConsole = ${revertConsole};
    revertConsole();
    resolve(logs);
`);

const waitEval = (ev) => {
    return new Promise((resolve) => {
        new Function('resolve', ev)(resolve);
    });
};

const handleJSRunner = async (req, res) => {
    const result = await waitEval(exec(req.body.code));
    console.log(result);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
}

let designs = [];

const handleHTMLRunner = async (req, res) => {
    const uuid = v4();
    designs.push({
        id: uuid,
        ...req.body,
    })
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ id: uuid }));
}

const handleDesign = async (req, res) => {
    const design = designs.find(d => d.id === req.params.uuid)
    if (!design) {
        res.end("not found!");
    } else {
        const width = parseInt(design.width) || 300;
        const height = parseInt(design.height) || 300;
        const padding = parseInt(design.padding) || 8;
        const background = design.background || "#36393F";
        const fontSize = design.fontsize || "16px";
        const font = design.font || "Poppins";
        const color = design.color || "#000";
        if (req.params.lang === "html") {
            res.end(`

            <html>
              <head>
                <link rel="stylesheet" type="text/css"
                      href="https://fonts.googleapis.com/css?family=${font}">
                <style>
                  body {
                font-family: "${font.split("+").join(" ")}", serif;
                color: ${color};
                background: ${background};
                overflow: hidden;
                margin: 0;
                flex-wrap: wrap;
                display: flex;
                justify-content: center;
                font-size: ${fontSize};
            }
            
            #update-code {
                display: block;
                width: 80%;
                height: 40px;
            }
            
            #code-edit {
                width: 80% !important;
                height: 300px !important;
            }
            
            .beginnercodes { 
                padding: ${padding}px;
                width: ${width}px;
                height: ${height}px;
            }
                </style>
              </head>
              <body>
            <div class="beginnercodes" id="${design.id}">
                ${design.code}
            </div>
                <button id="update-code">Update</button>
                <textarea id="code-edit">${design.code}</textarea>
            <script>
                document.getElementById("update-code").addEventListener("click", e => {
                    e.preventDefault();
                    const code = document.getElementById("code-edit");
                    const live = document.getElementById("${design.id}");
                    live.innerHTML = code.value;
                    designs = designs.map(d => {
                        if (d.id === design.id) d.code = code;
                        return d;
                    })
                });
            </script>
                         </body>
            </html>
        `);
        }
    }
}

router.get("/render/:lang/:uuid", handleDesign);
router.post("/html", handleHTMLRunner);
router.post("/js", handleJSRunner);
router.post("/javascript", handleJSRunner);
app.use("/", router);

const port = process.env.RUNNER_PORT || 8080;
const host = process.env.RUNNER_HOST || "0.0.0.0";

app.listen(port, host, () => {
    console.log("Started on " + host + ":" + port);
})