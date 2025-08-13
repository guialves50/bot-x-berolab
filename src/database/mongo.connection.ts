import mongoose from "mongoose";

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGO_URI!)
    console.log("Database has connected sucessfully")
  } catch(error) {
    console.error("Failed to try connect at database")
    process.exit(1)
  }
}