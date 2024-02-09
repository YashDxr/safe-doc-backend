import mongoose from "mongoose";
// import dotenv from 'dotenv'

export const useDatabase = (URL) => {
  mongoose
    .connect(URL)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log(err);
    });
};
