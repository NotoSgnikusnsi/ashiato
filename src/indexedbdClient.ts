type Place = {
  id: string;
  img: string;
  location: {
    lat: number;
    lon: number;
  };
};

const dbName = "test_ashiato";
let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      const objStore = db.createObjectStore("places", { keyPath: "id" });
      objStore.createIndex("img", "img", { unique: true });
      objStore.createIndex("location", "location", { unique: false });
    };

    request.onerror = (event) => {
      console.error("データベースにアクセスできません！！！");
      reject(event);
    };

    request.onsuccess = function (event) {
      db = (event.target as IDBOpenDBRequest).result;
      console.log("データベースにアクセスしました！！！");
      resolve(db);
    };
  });
};

const addRecord = (db: IDBDatabase, record: Place): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("places", "readwrite");
    const objStore = transaction.objectStore("places");

    const request = objStore.add(record);

    request.onerror = function () {
      console.error("Error adding record");
      reject();
    };

    request.onsuccess = function () {
      console.log("Record added successfully");
      resolve();
    };
  });
};

const fetchAllRecords = (db: IDBDatabase): Promise<Place[]> => {
  const records: Place[] = [];
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("places", "readonly");
    const objStore = transaction.objectStore("places");

    const request = objStore.openCursor();

    request.onerror = function () {
      console.error("Error getting records");
      reject();
    };

    request.onsuccess = function (e) {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        console.log("No more records");
        resolve(records);
      }
    };
  });
};

export { openDB, addRecord, fetchAllRecords };
export type { Place };