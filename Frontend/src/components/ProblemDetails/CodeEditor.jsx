import { React, useEffect, useState } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import axiosInstance from "../../utils/axios";

const CodeEditor = ({ lang, setLang, code, setCode, user }) => {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "FFFFFF", background: "#282828" }, // default text
        ],
        colors: {
          "editor.background": "#121212", // your custom background
          "editor.foreground": "#FFFFFF", // default text color
          "editor.lineHighlightBackground": "#1E1E1E",
          "editorCursor.foreground": "#FFCC00",
          "editor.selectionBackground": "#264F78",
          "editor.inactiveSelectionBackground": "#3A3D41",
        },
      });
    }
  }, [monaco]);

  const handleCodeChange = (value) => {
    setCode((prevCode) => ({ ...prevCode, [lang]: value }));
  };

  const languages = [
    { label: "C++", value: "cpp" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
  ];

  return (
    <div className="h-full flex flex-col p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-medium">Editor</h2>

          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-[#1a1a1a] text-white text-sm px-2 py-1 rounded-lg focus:outline-none"
            >
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex-1 border border-gray-700 rounded-md overflow-hidden mt-3">
        <Editor
          height="100%"
          language={lang}
          theme="custom-dark"
          value={code[lang]}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            lineNumbers: "on",
            fontFamily: "JetBrains Mono, monospace",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
