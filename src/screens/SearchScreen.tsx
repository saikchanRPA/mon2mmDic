import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import openDatabase from "../utils/db";
import DictionaryItem from "../components/DictionaryItem";
import { useNavigation } from "@react-navigation/native";

interface DicEntry {
  word: string;
  pos: string;
  definition: string;
  example: string;
}

const SearchScreen: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<DicEntry[]>([]);
  const [error, setError] = useState("");
  const navigation = useNavigation<any>();

  const handleSearch = async () => {
    setError("");
    if (!searchText.trim()) {
      setResults([]);
      setError("Please enter a search term");
      return;
    }

    try {
      const db = await openDatabase();
      // Log all tables and views to debug
      const tables = await db.getAllAsync(
        "SELECT name, type FROM sqlite_master WHERE type IN ('table','view')"
      );
      console.log("Tables and views in DB:", tables);
      // Now run the search query
      const query = `SELECT * FROM WordDefinition WHERE word LIKE ? OR definition LIKE ? LIMIT 100`;
      const params = [`%${searchText}%`, `%${searchText}%`];
      const rows = await db.getAllAsync(query, params);
      if (rows.length > 0) {
        setResults(rows as DicEntry[]);
        setError("");
        console.log("Search results:", rows);
      } else {
        setResults([]);
        setError("No results found");
        console.log("No results found for search term:", searchText);
      }
    } catch (err) {
      setError("Database error: " + (err as Error).message);
      console.error("Database error:", err);
      return;
    }
    console.log("Search completed for term:", searchText);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for a word or definition"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.input}
        onSubmitEditing={handleSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Search" onPress={handleSearch} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.word.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("Result", { entry: item })}>
            <DictionaryItem entry={item} />
          </TouchableOpacity>
        )}
        style={{ marginTop: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 8 },
  error: { color: "red", marginVertical: 8 },
});

export default SearchScreen;
