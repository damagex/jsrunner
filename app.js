const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const cors = require("cors");
const _eval = require("eval");

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

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const exec = (run) => (`
    module.exports = () => {
        let logs = [];
        let changeConsole = ["log", "warn", "error"];
        switchConsole();
        try {
            ${run}
        } catch (err) {
            console.error(err)
        }
        return logs;
    }
`);

const handleRunner = (req, res) => {
    const result = _eval(exec(req.body.run), "jsrunner", {
        switchConsole: switchConsole
    });
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