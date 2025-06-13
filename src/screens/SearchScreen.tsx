import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import openDatabase from "../utils/db";
import DictionaryItem from "../components/DictionaryItem";
import { useNavigation } from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

interface DicEntry {
  word: string;
  pos: string;
  definition: string;
  example: string;
}

const SearchScreen: React.FC = async () => {
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
      console.log("Search term is empty");
    }

    // Use the openDatabase function to get the database instance
  try {
      const db = await openDatabase();
      db.prepareAsync(
        `SELECT * FROM WordDefinition WHERE word LIKE '%${searchText}%' OR definition LIKE '%${searchText}%' LIMIT 100`),
        (result) => {
          if (result.rows.length > 0) {
            setResults(result.rows._array as DicEntry[]);
            setError("");
            console.log("Search results:", result.rows._array);
          } else {
            setResults([]);
            setError("No results found");
            console.log("No results found for search term:", searchText);
          }
        };
    } catch (err) {
      setError("Database error: " + (err as Error).message);
    }
    console.log("Search completed for term:", searchText);
  }
  // const handleSearch = async () => {
  //   setError("");
  //   if (!searchText.trim()) {
  //     setResults([]);
  //     setError("Please enter a search term");
  //     return;
      
  //   }
  //   // try {
  //   //   const db = await openDatabase();
  //   //   db.transaction((tx: any) => {
  //   //     tx.executeSql(
  //   //       `SELECT * FROM WordDefinition WHERE word LIKE ? OR definition LIKE ? LIMIT 100`,
  //   //       [`%${searchText}%`, `%${searchText}%`],
  //   //       (_: any, result: any) => {
  //   //         if (result.rows.length > 0) {
  //   //           setResults(result.rows._array as DicEntry[]);
  //   //           setError("");
  //   //         } else {
  //   //           setResults([]);
  //   //           setError("no results found");
  //   //         }
  //   //       },
  //   //       (_: any, error: any) => {
  //   //         console.error(error);
  //   //         setError("error searching database");
  //   //         return true;
  //   //       }
  //   //     );
  //   //   });
  //   // } catch (err) {
  //   //   setError("database error: " + (err as Error).message);
  //   // }

    
  // };

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
