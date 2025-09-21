import express from "express";
import { mongoose } from "mongoose";
import bodyParser from "body-parser";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";

import { localsMiddleware } from "./middleware/session.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(bodyParser.json());

const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/todo-app",
  collection: "sessions",
});

import userRoutes from "./routes/user.js";
import accountRoutes from "./routes/account.js";

app.set("view engine", "pug");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, "public")));

app.use(
  session({
    secret: "todo-app-secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(localsMiddleware);

app.use(userRoutes);
app.use(accountRoutes);

app.set("title", "Todo App");
app.get("title");

mongoose
  .connect("mongodb://localhost:27017/todo-app")
  .then(() => {
    console.log("Connected to MongoDB", "http://localhost:3000");
    app.listen(3000);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
