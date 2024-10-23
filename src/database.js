import mongoose from "mongoose";

const db = "MongoDB"

mongoose.connect("mongodb+srv://lonobas375:coder246@cluster0.kdomq.mongodb.net/BaseDeDatosBackendCoder")
    .then(() => console.log(`Successful connection - ${db}`))
    .catch((error) => console.log(`Error connecting - ${db}`, error))
    