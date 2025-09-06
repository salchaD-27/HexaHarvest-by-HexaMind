import { spawn } from 'child_process';

export async function modelBtester(input_data) {
  return new Promise((resolve, reject) => {
    const inputJSON = JSON.stringify({ input_data });

    const pythonProcess = spawn("python3", ["../models/B/modelB.py"]);

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

// const input_data = {
//     "gender": "male",
//     "age": 35,
//     "education": "secondary",
//     "farm_type": "pigfarm",
//     "years_farming": 10,
//     "follow_prescription": 1,
//     "check_expiry": 1,
//     "increase_dosage": 0,
//     "improvement_stop": 0,
//     "misuse_amr": 0,
//     "training_usage": 1,
//     "consult_veterinan": 1,
//     "amr_is_problem": 0,
//     "regulations": 1,
//     "withdraw": 1,
//     "importance_withdraw": 2,
//     "e_dispose": "return",
//     "p_dispose": "incineration",
//     "manure_mngt": "composting",
//     "store": "1-2 weeks",
//     "disease_chicken": [1, 3],
//     "disease_pig": [2],
//     "antibiotics_used": [1, 5]
// }
// modelBtester(input_data);