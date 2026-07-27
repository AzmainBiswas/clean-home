import { getBgCss, setBgCss } from "./utills/config";
import { attachScrollToRange, createElement } from "./utills/dom";

let db: IDBDatabase | undefined;

const dbRequest = indexedDB.open("BackgroundDB", 1);

dbRequest.onupgradeneeded = (e) => {
  const target = e.target as IDBOpenDBRequest;
  db = target.result;

  if (!db.objectStoreNames.contains("settings")) {
    db.createObjectStore("settings");
  }
};

dbRequest.onsuccess = (e) => {
  const target = e.target as IDBOpenDBRequest;
  db = target.result;

  console.log("DB ready");
  applyBackground();
};

async function saveBackground(file: File | Blob): Promise<void> {
  if (!db) {
    console.error("Database not initialized");
    return;
  }

  const transaction = db.transaction("settings", "readwrite");
  const store = transaction.objectStore("settings");
  const putRequest = store.put(file, "bgImage");

  transaction.oncomplete = () => {
    console.log("Background saved!");
    applyBackground();
  };

  putRequest.onerror = () => {
    console.error("Failed to save image");
  };
}

function applyBGCss() {
  const bgCss = getBgCss();
  const bgStyle = document.getElementById("bg-container")!.style;
  bgStyle.filter = `blur(${bgCss.blur || 0}px) brightness(${bgCss.brightness})`;
  bgStyle.transform = `scale(${bgCss.scale})`;
  bgStyle.position = "fixed";
  bgStyle.top = "0";
  bgStyle.left = "0";
  bgStyle.width = "100vw";
  bgStyle.height = "100vh";
  bgStyle.zIndex = "-1";
}

function applyBackground(): void {
  if (!db) return;

  const transaction = db.transaction("settings", "readonly");
  const store = transaction.objectStore("settings");
  const getRequest: IDBRequest<Blob | undefined> = store.get("bgImage");

  getRequest.onsuccess = () => {
    const blob = getRequest.result;
    if (blob instanceof Blob) {
      const imageUrl: string = URL.createObjectURL(blob);

      //apply css
      const bgStyle = document.getElementById("bg-container")!.style;
      bgStyle.backgroundImage = `url(${imageUrl})`;
      bgStyle.backgroundSize = "cover";
      bgStyle.backgroundPosition = "center";
      applyBGCss();
    } else {
      console.log("No image is there");
      //todo: add color here.
      //add more options.
      const bodyStyle = document.body.style;
      bodyStyle.background = "gray";
    }
  };

  getRequest.onerror = () => {
    console.log("Error");
  };
}

/** convert image to webp. */
async function ConvertImageToWebp(
  file: File | Blob,
  quality = 1.0,
): Promise<Blob> {
  const imageBitMap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.height = imageBitMap.height;
  canvas.width = imageBitMap.width;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(imageBitMap, 0, 0);

  return new Promise((reslove, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) reslove(blob);
        else reject(new Error("Image conversion failed"));
      },
      "image/webp",
      quality,
    );
  });
}

export function backgroundSelector(): HTMLDivElement {
  let bgCss = getBgCss();

  const div = createElement("div", { id: "background-options" });

  const imageContainer = createElement("div", {
    className: "container",
  })
  const image = createElement("input", {
    id: "background-selector",
    type: "file",
    accept: "image/*",
  });
  const imageLabel = createElement("label", {
    for: "background-selector",
    textContent: "Choose Background Photo",
  });

  imageContainer.append(imageLabel, image);

  const blurContainer = createElement("div", {
    className: "container",
  })
  const blur = createElement("input", {
    id: "blur-range",
    type: "range",
    value: `${bgCss.blur}`,
    min: "0.0",
    max: "20.0",
    step: "0.5",
  });
  const blurLabel = createElement("label", {
    for: "blur-range",
    textContent: "Blur",
  });
  blurContainer.append(blurLabel, blur);

  const brighContainer = createElement("div", {
    className: "container",
  })
  const brightness = createElement("input", {
    id: "brightness-range",
    type: "range",
    value: `${bgCss.brightness}`,
    min: "0.0",
    max: "1.0",
    step: "0.01",
  });
  const brightnessLabel = createElement("label", {
    for: "brightness-range",
    textContent: "Brightness",
  });
  brighContainer.append(brightnessLabel, brightness);

  const scaleContainer = createElement("div", {
    className: "container",
  })
  const scale = createElement("input", {
    id: "scale-range",
    type: "range",
    value: `${bgCss.scale}`,
    min: "1.1",
    max: "5.0",
    step: "0.05",
  });
  const scaleLabel = createElement("label", {
    for: "scale-range",
    textContent: "Scale",
  });
  scaleContainer.append(scaleLabel, scale);

  image.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      ConvertImageToWebp(file).then((image) => saveBackground(image));
    }
  });

  blur.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    bgCss.blur = parseFloat(target.value);
    console.log(bgCss);
    setBgCss(bgCss);
    applyBGCss();
  });

  brightness.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    bgCss.brightness = parseFloat(target.value);
    console.log(bgCss);
    setBgCss(bgCss);
    applyBGCss();
  });

  scale.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    bgCss.scale = parseFloat(target.value);
    console.log(bgCss);
    setBgCss(bgCss);
    applyBGCss();
  });

  attachScrollToRange(blur);
  attachScrollToRange(brightness);
  attachScrollToRange(scale);

  div.append(imageContainer, blurContainer, brighContainer, scaleContainer);
  return div;
}
