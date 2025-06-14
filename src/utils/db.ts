import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

const DB_NAME = "monDic.db";
let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  // If using a bundled database, copy from assets on first run
  const dbUri = `${FileSystem.documentDirectory}${DB_NAME}`;
  const dbExists = await FileSystem.getInfoAsync(dbUri);
  if (!dbExists.exists) {
    // Load the asset and get its localUri
    const [asset] = await Asset.loadAsync(require("../../assets/monDic.db"));
    const assetUri = asset.localUri || asset.uri;
    if (!assetUri) throw new Error("Asset URI not found for monDic.db");
    await FileSystem.copyAsync({ from: assetUri, to: dbUri });
  }
  db = await SQLite.openDatabaseAsync(DB_NAME) as any; // Cast to any to allow transaction
  return db;
}

export default openDatabase;
