// useIndexedDB.js
import { useState, useCallback } from "react";

const DB_NAME = "GroupSplit";
const DB_VERSION = 1;
const STORE_NAME = "expenses";

// Initialize IndexedDB database
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

// Main hook
export const useIndexedDB = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save JSON to IndexedDB
  const saveJSON = useCallback(async (fileName, data) => {
    setLoading(true);
    setError(null);
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      store.put({
        id: fileName,
        data: data,
        timestamp: new Date().toISOString(),
      });

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log("Saved to IndexedDB:", fileName);
          setLoading(false);
          resolve(true);
        };
        transaction.onerror = () => {
          setError(transaction.error.message);
          setLoading(false);
          reject(transaction.error);
        };
      });
    } catch (err) {
      console.error("Error saving to IndexedDB:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Retrieve JSON from IndexedDB
  const getJSON = useCallback(async (fileName) => {
    setLoading(true);
    setError(null);
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(fileName);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = JSON.parse(request.result?.data) || null;
          console.log("Retrieved from IndexedDB:", fileName);
          setLoading(false);
          resolve(result);
        };
        request.onerror = () => {
          setError(request.error.message);
          setLoading(false);
          reject(request.error);
        };
      });
    } catch (err) {
      console.error("Error retrieving from IndexedDB:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Delete file from IndexedDB
  const deleteJSON = useCallback(async (fileName) => {
    setLoading(true);
    setError(null);
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(fileName);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log("Deleted from IndexedDB:", fileName);
          setLoading(false);
          resolve(true);
        };
        transaction.onerror = () => {
          setError(transaction.error.message);
          setLoading(false);
          reject(transaction.error);
        };
      });
    } catch (err) {
      console.error("Error deleting from IndexedDB:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Get all files metadata
  const getAllFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const files = request.result.map((item) => {
            const data = JSON.parse(item.data);
            return {
              id: item.id,
              tripName: data.tripName,
              participants: data.participants,
              timestamp: item.timestamp,
            };
          });
          files.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          console.log("Retrieved all files:", files);
          setLoading(false);
          resolve(files);
        };
        request.onerror = () => {
          setError(request.error.message);
          setLoading(false);
          reject(request.error);
        };
      });
    } catch (err) {
      console.error("Error retrieving files:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Clear all files
  const clearAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log("Cleared all files from IndexedDB");
          setLoading(false);
          resolve(true);
        };
        transaction.onerror = () => {
          setError(transaction.error.message);
          setLoading(false);
          reject(transaction.error);
        };
      });
    } catch (err) {
      console.error("Error clearing IndexedDB:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    saveJSON,
    getJSON,
    deleteJSON,
    getAllFiles,
    clearAll,
    loading,
    error,
  };
};
