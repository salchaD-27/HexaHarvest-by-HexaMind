import { spawn } from "child_process";

export async function modelA1tester(soil_data) {
  return new Promise((resolve, reject) => {
    const inputJSON = JSON.stringify(soil_data);
    const pythonProcess = spawn("python3", ["../models/A/modelA1.py"]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdin.write(inputJSON);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (err) {
          reject(new Error("Failed to parse Python output: " + err.message));
        }
      } else {
        reject(new Error("Python process exited with code " + code + ": " + errorOutput));
      }
    });

    pythonProcess.on("error", (err) => {
      reject(err);
    });
  });
}

// const soil_data = {
//     "Nitrogen": 90,
//     "Phosphorus": 42,
//     "Potassium": 43,
//     "temprature": 20.8,
//     "humidity": 82,
//     "ph": 6.5,
//     "rainfall": 200
// }
// modelA1tester(soil_data)