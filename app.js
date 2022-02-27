import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const router = express.Router();
const app = express();
let logs = []
let prev = "";
let changeConsole = ["log", "info", "warn", "error", "fatal", "timeEnd", "timeLog", "timeStamp", "table", "dir", "dirxml", "system"];
const defConsole = {};
const switchConsole = () => {
    changeConsole.forEach(type => {
        defConsole[type] = console[type];
        console[type] = function () {
            let args = Array.from(arguments);
            if (!type.includes("time") && !type.includes("table")) {
                if (prev === "time" && type === "log") {
                    args[0] = "Timer: " + args[0]
                    args.shift();
                }
                logs.push({
                    type: type,
                    args: args
                });
            }
            prev = type;
            type = type === "fatal" ? "error" : type;
            defConsole[type].apply(console, args);
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
    let prev = "";
    let changeConsole = [${changeConsole.map(i => "'" + i + "'")}];
    const defConsole = {};
    const switchConsole = ${switchConsole};
    const revertConsole = ${revertConsole};
    switchConsole();
    try {
        ${run}
    } catch (err) {
        console.error(JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))))
    }
    revertConsole();
    resolve(logs);
`);

const waitEval = (ev) => {
    return new Promise((resolve, reject) => {
        new Function('resolve', ev)(resolve);
    });
};

const handleRunner = async (req, res) => {
    const result = await waitEval(exec(req.body.run));
    console.log(result);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
}

router.post("/run", handleRunner);
app.use("/", router);

const port = process.env.RUNNER_PORT || 8080;
const host = process.env.RUNNER_HOST || "0.0.0.0";

app.listen(port, host, () => {
    console.log("Started on " + host + ":" + port);
})