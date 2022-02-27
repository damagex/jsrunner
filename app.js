const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const cors = require("cors");
const fs = require("fs");
const childProcess = require('child_process');

let logs = []
let changeConsole = ["log", "warn", "error"];
const defConsole = {};
const switchConsole = () => {
    logs = [];
    changeConsole.forEach((type) => {
        defConsole[type] = console[type];
        console[type] = function () {
            let args = Array.from(arguments);
            logs.push({
                type: type,
                args: args
            });
            defConsole[type].apply(console, args);
        }
    })
}

const revertConsole = () => {
    Object.keys(defConsole).forEach(def => {
        console[def] = defConsole[def];
    });
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const createScript = (content, callback) => {
    const filename = "run-" + new Date().getTime() + ".js";
    fs.writeFile(filename, content, (err) => {
        if (err) throw err;
        console.log('File is created successfully.');
    });
    callback(filename);
}

const runScript = (scriptPath, callback) => {
    let invoked = false;
    let process = childProcess.fork(scriptPath);

    process.on("error", function (err) {
        if (invoked) return;
        invoked = true;
        callback(err, process);
    });

    process.on("exit", function (code) {
        if (invoked) return;
        invoked = true;
        const err = code === 0 ? null : new Error("exit code " + code);
        callback(err, process);
    });
}

const handleRunner = (req, res) => {
    createScript(req.body.run, filename => {
        runScript('./' + filename, (err, process) => {
            if (err) throw err;
            logs.push({
                type: "log",
                args: process.stdout
            })
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(logs));
        });
    });
}

router.post("/run", handleRunner);
app.use("/", router);

const port = process.env.RUNNER_PORT || 8080;
const host = process.env.RUNNER_HOST || "0.0.0.0";

app.listen(port, host, () => {
    console.log("Started on " + host + ":" + port);
})