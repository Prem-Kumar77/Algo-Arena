import { spawn } from "child_process";
import path from "path";
import fsp from "fs/promises";
import { v4 as uuid } from "uuid";

async function judgeCode({ code, language, testCases }) {
  const tempDir = "./temp";

  // Ensure temp directory exists
  await fsp.mkdir(tempDir, { recursive: true });

  const uniqueId = uuid();
  let compileCmd, runCmd, fileName;

  switch (language) {
    case "cpp":
      fileName = `solution_${uniqueId}.cpp`;
      const exeFile = `solution_${uniqueId}.exe`;
      await fsp.writeFile(path.join(tempDir, fileName), code);
      compileCmd = `g++ ${path.join(tempDir, fileName)} -o ${path.join(tempDir, exeFile)}`;
      runCmd = path.join(tempDir, exeFile);
      break;

    case "java":
      fileName = `Solution.java`;
      await fsp.writeFile(path.join(tempDir, fileName), code);
      compileCmd = `javac ${path.join(tempDir, fileName)}`;
      runCmd = `java -cp ${tempDir} Solution`;
      break;

    case "python":
      fileName = `solution_${uniqueId}.py`;
      await fsp.writeFile(path.join(tempDir, fileName), code);
      runCmd = `python3 ${path.join(tempDir, fileName)}`;
      break;

    default:
      return { verdict: "Language not supported" };
  }

  // --- Step 1: Compile if needed ---
  if (compileCmd) {
    try {
      await executeCommand(compileCmd);
    } catch (err) {
      return {
        verdict: "Compilation Error",
        errorMessage: parseCompileError(err.toString()), // ✅
        details: null,
        passedCases: 0,
        language,
      };
    }
  }

  // --- Step 2: Run test cases ---
  const results = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const input = String(tc.input || "");
    const expectedOutput = String(tc.output || "").trim();

    try {
      const rawOutput = await executeCommand(runCmd, input);
      const output = String(rawOutput || "").trim();
      const passed = output === expectedOutput;

      if (passed) passedCount++;

      results.push({
        testCase: i + 1,
        passed,
        input,
        expectedOutput,
        output,
      });

      // Optional: stop early if WA after 3rd case
      if (i >= 2 && !passed){
        console.log(input,expectedOutput);
        break;
      } 
    } catch (err) {
      results.push({
        testCase: i + 1,
        passed: false,
        input,
        expectedOutput,
        output: null,
        errorMessage: err.toString(), // ✅
      });
    }
  }

  // --- Step 3: Cleanup temp files ---
  await fsp.rm(tempDir, { recursive: true, force: true });

  // --- Step 4: Decide verdict ---
  const verdict =
    passedCount === testCases.length ? "Accepted" : "Wrong Answer";

  return {
    verdict,
    passedCases: passedCount,
    total: testCases.length,
    details: results,
    errorMessage:
      verdict === "Accepted"
        ? null
        : results.find((r) => r.errorMessage)?.errorMessage || null, // ✅
  };
}

function parseCompileError(stderr) {
  const lines = stderr.split("\n");
  for (const line of lines) {
    const match = line.match(/:(\d+):(\d+): error: (.*)/);
    if (match) {
      const [, lineNum, colNum, msg] = match;
      return `Line ${lineNum}, Char ${colNum}: ${msg}`;
    }
  }
  return lines[0] || "Unknown compilation error";
}

async function executeCommand(command, input = "") {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, { shell: true });
    let output = "";
    let errorOutput = "";

    proc.stdout.on("data", (data) => (output += data.toString()));
    proc.stderr.on("data", (data) => (errorOutput += data.toString()));

    if (input) proc.stdin.write(input + "\n");
    proc.stdin.end();

    proc.on("close", (code) => {
      if (code !== 0) reject(errorOutput || `Process exited with code ${code}`);
      else resolve(output);
    });

    proc.on("error", (err) => reject(err.message || errorOutput));
  });
}

export default judgeCode;
