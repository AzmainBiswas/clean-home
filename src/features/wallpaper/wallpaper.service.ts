const DB_NAME = "BackgroundDB";
const STORE_NAME = "settings";
const BG_KEY = "bgImage";

export class WallpaperService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };
    });

    return this.dbPromise;
  }

  async saveBackground(file: File | Blob): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const putRequest = store.put(file, BG_KEY);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Failed to save background image"));
      putRequest.onerror = () => reject(new Error("IndexedDB put failed"));
    });
  }

  async getBackground(): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getRequest: IDBRequest<Blob | undefined> = store.get(BG_KEY);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result instanceof Blob ? result : null);
      };

      getRequest.onerror = () => reject(new Error("Failed to get background image"));
    });
  }

  /**
   * Converts an uploaded image to WebP format for optimized storage and loading.
   */
  async convertImageToWebp(file: File | Blob, quality = 1.0): Promise<Blob> {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas 2d context");

    ctx.drawImage(imageBitmap, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("WebP conversion failed"));
        },
        "image/webp",
        quality,
      );
    });
  }
}

export const wallpaperService = new WallpaperService();
