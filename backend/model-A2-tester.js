import { spawn } from "child_process";

export async function modelA2tester(yield_data) {
  return new Promise((resolve, reject) => {
    const inputJSON = JSON.stringify(yield_data);
    const pythonProcess = spawn("python3", ["../models/A/modelA2.py"]);

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


// const yield_data = {
//     "Crop": "Wheat",
//     "Season": "Rabi       ",
//     "State": "Punjab",
//     "Area": 100.0,
//     "Production": 200.0,
//     "Annual_Rainfall": 500.0,
//     "Fertilizer": 20.0,
//     "Pesticide": 5.0
// }
// modelA2tester(yield_data)