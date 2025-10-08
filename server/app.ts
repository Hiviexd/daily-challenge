import express, { ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import session from "express-session";
import MongoStoreSession from "connect-mongo";
import "express-async-errors";
import { logger } from "@middlewares/logger";
import path from "path";
import utils from "@utils/index";

// Load config
import { loadJson } from "@utils/config";
import { IConfig } from "@interfaces/Config";

const config = loadJson<IConfig>("../config.json");

// Return the "new" updated object by default when doing findByIdAndUpdate
mongoose.plugin((schema) => {
    schema.pre("findOneAndUpdate", function (this: any) {
        if (!("new" in this.options)) {
            this.setOptions({ new: true });
        }
    });
});

const app = express();
const MongoStore = MongoStoreSession(session);

// settings/middlewares
app.use(logger);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());

// Handle payload too large error
const payloadErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err?.type === "entity.too.large") {
        return res.status(413).json({ error: "Request entity too large" });
    }
    next(err);
};

app.use(payloadErrorHandler);

// database
mongoose.connect(config.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});
const database = mongoose.connection;

database.on(
    "error",
    console.error.bind(console, utils.consoleStyles("✗ Database connection error", ["red", "underline"]))
);
database.once("open", function () {
    console.log(utils.consoleStyles("✓ Database connected", ["green", "bold", "underline"]));
});

app.use(
    session({
        secret: config.session,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: "lax",
        },
    })
);

// routes
import authRouter from "@routers/authRouter";
import usersRouter from "@routers/usersRouter";
import roundRouter from "@routers/roundRouter";
import settingsRouter from "@routers/settingsRouter";

// setup api routes
const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/rounds", roundRouter);
apiRouter.use("/settings", settingsRouter);

app.use("/api", apiRouter);

// 404 handler for API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
});

// serve production frontend
import { fileURLToPath } from "url";

// At top of your file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
    const clientDist = path.join(__dirname, "../client");

    // serve static frontend files
    app.use(express.static(clientDist));

    // fallback to index.html for SPA routes, exclude /api/*
    app.get(/^(?!\/api\/).*/, (req, res) => {
        const indexFile = path.join(clientDist, "index.html");

        res.sendFile(indexFile, (err) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            }
        });
    });
}

// catch 404
app.use((req, res) => {
    // Check if it's an API request
    if (req.path.startsWith("/api/")) {
        res.status(404).json({ error: "API endpoint not found" });
    } else {
        res.status(404).json({ error: "Not Found" });
    }
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    let customErrorMessage = "";
    if (err.name == "DocumentNotFoundError") customErrorMessage = "Error: Object not found";

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.json({ error: customErrorMessage || err.message || "Something went wrong!" });

    console.log(err);
});

// server setup
const port = process.env.PORT || "3113";
const environmentString = process.env.NODE_ENV || "⚠ Unknown";
const environmentStyled = process.env.NODE_ENV
    ? utils.consoleStyles(process.env.NODE_ENV, ["yellow", "underline"])
    : utils.consoleStyles("⚠ Unknown", ["orange", "underline"]);

const mode = () => {
    if (process.env.AUTOMATION_DEBUG === "true") return "Auto-start Automation Jobs";
    if (process.env.MIGRATION === "true") return "Run Migrations";
    return "";
};

app.set("port", port);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import MigrationService from "./services/MigrationService";

app.listen(port, () => {
    console.log("┌──────────────────────────────────────────────────────────┐");
    console.log(`│ ${utils.consoleStyles("✓ Server started", ["green", "bold"])}${" ".repeat(41)}│`);
    console.log(
        `│   ${utils.consoleStyles("Port:", ["dim"])} ${utils.consoleStyles(port, ["cyan"])}${" ".repeat(
            49 - port.length
        )}│`
    );
    console.log(
        `│   ${utils.consoleStyles("Environment:", ["dim"])} ${environmentStyled}${" ".repeat(
            42 - environmentString.length
        )}│`
    );
    if (mode().length)
        console.log(
            `│   ${utils.consoleStyles("Mode:", ["dim"])} ${utils.consoleStyles(mode(), ["orange", "bold"])}${" ".repeat(
                49 - mode().length
            )}│`
        );
    console.log("└──────────────────────────────────────────────────────────┘");

    // Run migrations by adding/uncommenting the needed migration and running `yarn dev-migration`
    // MigrationService.migrateRounds();
});

export default app;
