import express from "express";
import dotenv from "dotenv";
import cors from "cors";

export const init = (app) => {
    dotenv.config();

    app.use(express.json());
    app.use(
        cors({
            origin: "*"
        })
    );
}
