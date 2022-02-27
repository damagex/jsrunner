const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const cors = require("cors");
const _eval = require("_eval");

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

const handleRunner = (req, res) => {
    switchConsole();
    try {
        const result = _eval(req.body.run);
        console.log(result);
    } catch (err) {
        console.error(err)
    }
    revertConsole();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(logs));
}

router.post("/run", handleRunner);
app.use("/", router);

const port = process.env.RUNNER_PORT || 8080;
const host = process.env.RUNNER_HOST || "0.0.0.0";

app.listen(port, host, () => {
    console.log("Started on " + host + ":" + port);
})