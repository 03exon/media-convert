import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const fileInput = document.querySelector("#file-input");
const dropZone = document.querySelector("#drop-zone");
const selectedFileBox = document.querySelector("#selected-file");
const fileName = document.querySelector("#file-name");
const fileSize = document.querySelector("#file-size");
const formatSelect = document.querySelector("#format-select");
const convertButton = document.querySelector("#convert-button");
const removeButton = document.querySelector("#remove-file");
const progressArea = document.querySelector("#progress-area");
const progressFill = document.querySelector("#progress-fill");
const progressPercent = document.querySelector("#progress-percent");
const statusText = document.querySelector("#status-text");
const resultArea = document.querySelector("#result-area");
const resultName = document.querySelector("#result-name");
const downloadLink = document.querySelector("#download-link");
const errorMessage = document.querySelector("#error-message");

let selectedFile = null;
let ffmpeg = null;
let ffmpegLoaded = false;
let resultUrl = null;

document.querySelector("#year").textContent = new Date().getFullYear();

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeBaseName(name) {
  return name.replace(/\.[^/.]+$/, "").replace(/[^\w-]+/g, "-").replace(/-+/g, "-").slice(0, 70) || "converted-file";
}

function isVideo(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  return file.type.startsWith("video/") || ["mp4", "mov", "mkv", "webm", "avi", "m4v"].includes(ext);
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearResult() {
  resultArea.classList.add("hidden");
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  downloadLink.removeAttribute("href");
}

function setFile(file) {
  errorMessage.classList.add("hidden");
  clearResult();
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) {
    showError("This starter version limits files to 100 MB. On iPhone, smaller files (under 50 MB) are recommended because conversion uses device memory.");
    return;
  }
  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  selectedFileBox.classList.remove("hidden");
  formatSelect.disabled = false;
  formatSelect.value = isVideo(file) ? "mp3" : "mp3";
  formatSelect.querySelector('option[value="mp4"]').disabled = !isVideo(file);
  convertButton.disabled = false;
}

function resetFile() {
  selectedFile = null;
  fileInput.value = "";
  selectedFileBox.classList.add("hidden");
  formatSelect.disabled = true;
  convertButton.disabled = true;
  progressArea.classList.add("hidden");
  errorMessage.classList.add("hidden");
  clearResult();
}

fileInput.addEventListener("change", () => setFile(fileInput.files?.[0]));

removeButton.addEventListener("click", resetFile);

for (const eventName of ["dragenter", "dragover"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
}
for (const eventName of ["dragleave", "drop"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
  });
}
dropZone.addEventListener("drop", (event) => setFile(event.dataTransfer?.files?.[0]));

async function loadConverter() {
  if (ffmpegLoaded) return;
  statusText.textContent = "Loading converter engine (first use is about 30 MB)…";
  progressFill.style.width = "8%";
  progressPercent.textContent = "Loading";
  ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => {
    if (message) statusText.textContent = message.slice(0, 100);
  });
  ffmpeg.on("progress", ({ progress }) => {
    if (Number.isFinite(progress)) {
      const percent = Math.max(8, Math.min(95, Math.round(progress * 100)));
      progressFill.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;
    }
  });

  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  ffmpegLoaded = true;
}

convertButton.addEventListener("click", async () => {
  if (!selectedFile) return;
  const outputFormat = formatSelect.value;
  if (outputFormat === "mp4" && !isVideo(selectedFile)) {
    showError("MP4 video output needs a video input file. Choose a video file or select MP3/WAV.");
    return;
  }

  errorMessage.classList.add("hidden");
  clearResult();
  progressArea.classList.remove("hidden");
  convertButton.disabled = true;
  formatSelect.disabled = true;
  progressFill.style.width = "3%";
  progressPercent.textContent = "Starting";
  statusText.textContent = "Preparing conversion…";

  const inputExtension = selectedFile.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const inputName = `input.${inputExtension}`;
  const outputName = `${safeBaseName(selectedFile.name)}.${outputFormat}`;

  try {
    await loadConverter();
    statusText.textContent = "Reading your file…";
    progressFill.style.width = "12%";
    await ffmpeg.writeFile(inputName, await fetchFile(selectedFile));

    let args;
    if (outputFormat === "mp3") {
      args = ["-i", inputName, "-vn", "-c:a", "libmp3lame", "-b:a", "192k", outputName];
    } else if (outputFormat === "wav") {
      args = ["-i", inputName, "-vn", "-c:a", "pcm_s16le", outputName];
    } else {
      args = ["-i", inputName, "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outputName];
    }

    statusText.textContent = "Converting… Keep this tab open.";
    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) throw new Error("The converter could not process this file or the requested codec is unavailable.");

    const data = await ffmpeg.readFile(outputName);
    const mime = outputFormat === "mp3" ? "audio/mpeg" : outputFormat === "wav" ? "audio/wav" : "video/mp4";
    resultUrl = URL.createObjectURL(new Blob([data], { type: mime }));
    downloadLink.href = resultUrl;
    downloadLink.download = outputName;
    resultName.textContent = outputName;
    resultArea.classList.remove("hidden");
    progressFill.style.width = "100%";
    progressPercent.textContent = "Done";
    statusText.textContent = "Conversion complete";
  } catch (error) {
    console.error(error);
    showError(`Conversion failed: ${error?.message || "Unknown error"}. Try a smaller file or a different output format. Keep in mind that some codecs and unusual files may not be supported.`);
    progressArea.classList.add("hidden");
  } finally {
    convertButton.disabled = false;
    formatSelect.disabled = false;
    try { await ffmpeg?.deleteFile(inputName); } catch {}
  }
});
