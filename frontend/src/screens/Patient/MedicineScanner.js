import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage } from '../../services/ocrService';
import { extractMedicineInfoFromBackend } from '../../services/backendService';
export default function MedicineScanner() {
  const [photoUri, setPhotoUri] = useState(null);
  const [extractedLines, setExtractedLines] = useState([]);
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickOrCapture = async (fromCamera = false) => {
    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });

      if (result.canceled) return;

      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setExtractedLines([]);
      setMedicineInfo(null);
      setLoading(true);

      const lines = await extractTextFromImage(asset.uri);
      setExtractedLines(lines);
const info = await extractMedicineInfoFromBackend(lines.join('\n'));
if (!info) Alert.alert('No structured info extracted');
setMedicineInfo(info);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medicine Scanner</Text>

      <View style={styles.buttonRow}>
        <Button title="Take Photo" onPress={() => handlePickOrCapture(true)} />
        <View style={{ width: 12 }} />
        <Button title="Pick from Library" onPress={() => handlePickOrCapture(false)} />
      </View>

      {photoUri && <Image source={{ uri: photoUri }} style={styles.image} />}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}
    {/* OCR text display commented out */}
    {/* {!loading && extractedLines.length > 0 && (
      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>OCR Text:</Text>
        {extractedLines.map((line, i) => <Text key={i}>{line}</Text>)}
      </View>
    )} */}

      {!loading && medicineInfo && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Medicine Info:</Text>
          <Text>Name: {medicineInfo.name}</Text>
          <Text>Dosage Form: {medicineInfo.dosageForm}</Text>
          <Text>Strength: {medicineInfo.strength}</Text>
          <Text>Instructions: {medicineInfo.instructions}</Text>
          <Text>Manufacturer: {medicineInfo.manufacturer}</Text>
          <Text>Warnings: {medicineInfo.warnings}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', marginVertical: 10 },
  image: { width: 280, height: 280, borderRadius: 8, marginTop: 18 },
  resultBox: { width: '100%', marginTop: 20, backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2 },
  resultTitle: { fontWeight: '700', marginBottom: 8 },
});
