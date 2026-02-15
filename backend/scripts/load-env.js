const fs = require("fs");
const path = require("path");

// .envファイルから環境変数を読み込む
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  const envExamplePath = path.join(__dirname, "..", ".env.example");
  const envJsonPath = path.join(__dirname, "..", "env.json");

  let envVars = {};

  // .envファイルが存在する場合は読み込む
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        const value = valueParts.join("=").trim();
        if (key && value) {
          envVars[key.trim()] = value;
        }
      }
    });
  } else if (fs.existsSync(envExamplePath)) {
    console.warn(
      "⚠️  .envファイルが見つかりません。.env.exampleを参考に.envファイルを作成してください。",
    );
  }

  // env.jsonを更新
  const envJson = {
    Parameters: {
      GEMINI_API_KEY:
        envVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
      GOOGLE_MAPS_API_KEY:
        envVars.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "",
      NODE_ENV: "development",
    },
  };

  fs.writeFileSync(envJsonPath, JSON.stringify(envJson, null, 2));
  console.log("✅ env.jsonを更新しました");
}

loadEnvFile();
