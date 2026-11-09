import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import "./style.css";

const input = document.querySelector("#file-input");
const dropzone = document.querySelector("#dropzone");
const selectedPanel = document.querySelector("#selected-file");
const selectedName = document.querySelector("#selected-name");
const selectedSize = document.querySelector("#selected-size");
const removeButton = document.querySelector("#remove-file");
const formatSelect = document.querySelector("#format-select");
const convertButton = document.querySelector("#convert-button");
const buttonLabel = document.querySelector("#button-label");
const progressArea = document.querySelector("#progress-area");
const progressLabel = document.querySelector("#progress-label");
const progressPercent = document.querySelector("#progress-percent");
const progressFill = document.querySelector("#progress-fill");
const result = document.querySelector("#result");
const resultName = document.querySelector("#result-name");
const downloadLink = document.querySelector("#download-link");
const fileTitle = document.querySelector("#file-title");
const fileSubtitle = document.querySelector("#file-subtitle");

let selectedFile = null;
let ffmpeg = null;
let isConverting = false;
let outputUrl = null;

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function setProgress(value, label) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  progressFill.style.width = `${safe}%`;
  progressPercent.textContent = `${safe}%`;
  if (label) progressLabel.textContent = label;
}

function clearResult() {
  result.hidden = true;
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  outputUrl = null;
  downloadLink.removeAttribute("href");
}

function chooseFile(file) {
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) {
    alert("This file is larger than 100 MB. Please choose a smaller file.");
    return;
  }
  if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
    alert("Please choose an audio or video file.");
    return;
  }
  selectedFile = file;
  clearResult();
  selectedName.textContent = file.name;
  selectedSize.textContent = formatBytes(file.size);
  selectedPanel.hidden = false;
  dropzone.style.display = "none";
  convertButton.disabled = false;
  buttonLabel.textContent = "Convert file";
  const kind = file.type.startsWith("video/") ? "video" : "audio";
  [...formatSelect.options].forEach(option => {
    option.disabled = option.value === "mp4" && kind === "audio";
  });
  if (kind === "audio" && formatSelect.value === "mp4") formatSelect.value = "mp3";
}

function resetFile() {
  selectedFile = null;
  input.value = "";
  selectedPanel.hidden = true;
  dropzone.style.display = "flex";
  convertButton.disabled = true;
  buttonLabel.textContent = "Choose a file to begin";
  progressArea.hidden = true;
  clearResult();
}

input.addEventListener("change", (event) => chooseFile(event.target.files[0]));
removeButton.addEventListener("click", resetFile);

["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, event => {
  event.preventDefault();
  dropzone.classList.add("dragover");
}));
["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, event => {
  event.preventDefault();
  dropzone.classList.remove("dragover");
}));
dropzone.addEventListener("drop", event => chooseFile(event.dataTransfer.files[0]));

formatSelect.addEventListener("change", () => {
  document.querySelector("#quality-value").innerHTML = formatSelect.value === "wav"
    ? 'Uncompressed <span>●</span>' : 'High quality <span>●</span>';
  clearResult();
});

async function getFFmpeg() {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();
  ffmpeg.on("progress", ({ progress }) => setProgress(progress * 100, "Converting your file…"));
  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
  setProgress(5, "Loading conversion engine…");
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
  });
  return ffmpeg;
}

convertButton.addEventListener("click", async () => {
  if (!selectedFile || isConverting) return;
  isConverting = true;
  convertButton.disabled = true;
  progressArea.hidden = false;
  clearResult();
  buttonLabel.textContent = "Converting…";
  setProgress(2, "Preparing your file…");
  let ff;
  try {
    ff = await getFFmpeg();
    const ext = selectedFile.name.includes(".") ? selectedFile.name.split(".").pop().toLowerCase() : "bin";
    const inputName = `source.${ext.replace(/[^a-z0-9]/g, "") || "bin"}`;
    const outputFormat = formatSelect.value;
    const outputName = `converted.${outputFormat}`;
    await ff.writeFile(inputName, await fetchFile(selectedFile));
    let args;
    if (outputFormat === "mp3") args = ["-i", inputName, "-vn", "-codec:a", "libmp3lame", "-q:a", "2", outputName];
    else if (outputFormat === "wav") args = ["-i", inputName, "-vn", "-acodec", "pcm_s16le", outputName];
    else args = ["-i", inputName, "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-movflags", "+faststart", outputName];
    await ff.exec(args);
    const data = await ff.readFile(outputName);
    const mime = outputFormat === "mp3" ? "audio/mpeg" : outputFormat === "wav" ? "audio/wav" : "video/mp4";
    outputUrl = URL.createObjectURL(new Blob([data.buffer], { type: mime }));
    downloadLink.href = outputUrl;
    downloadLink.download = outputName;
    resultName.textContent = outputName;
    result.hidden = false;
    setProgress(100, "Conversion complete");
    buttonLabel.textContent = "Convert another file";
  } catch (error) {
    console.error(error);
    setProgress(0, "Conversion failed");
    alert("Sorry, conversion failed. Try a smaller file or a different format. Some formats may not be supported by the browser engine.");
    buttonLabel.textContent = "Try again";
  } finally {
    isConverting = false;
    convertButton.disabled = !selectedFile;
  }
});
