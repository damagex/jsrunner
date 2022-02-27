const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: "*",
    methods: ["POST"],
}

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

app.use(cors(corsOptions))

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post("/run", (request, response) => {
    switchConsole();
    try {
        eval(request.body.run);
    } catch (err) {
        console.error(err)
    }
    revertConsole();
    response.end(JSON.stringify(logs));
});

// add router in the Express app.
app.use("/", router);

const port = process.env.RUNNER_PORT || 8080;
const host = process.env.RUNNER_HOST || "0.0.0.0";

app.listen(port, "0.0.0.0", () => {
    console.log("Started on " + host + ":" + port);
})