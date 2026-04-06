import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../../api/client';

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned]   = useState(false);
  const [result, setResult]     = useState(null);  // last scan result
  const [loading, setLoading]   = useState(false);
  const [showResult, setShowResult] = useState(false);
  const cooldownRef = useRef(false);

  const handleScan = async ({ data }) => {
    if (cooldownRef.current || loading) return;
    cooldownRef.current = true;
    setScanned(true);
    setLoading(true);

    try {
      const res = await api.post('/log_attendance.php', { qr_token: data });
      setResult({
        success: res.data.success,
        message: res.data.message ?? (res.data.success ? 'Attendance logged.' : 'Failed.'),
        employee: res.data.employee_name ?? null,
        action: res.data.action ?? null,
        time: res.data.time ?? null,
      });
      setShowResult(true);
    } catch (e) {
      setResult({ success: false, message: 'Network error. Try again.' });
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setShowResult(false);
    setScanned(false);
    setResult(null);
    // Allow next scan after a short delay
    setTimeout(() => { cooldownRef.current = false; }, 1000);
  };

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permText}>Camera access is needed to scan QR codes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Text style={styles.headerSub}>Point camera at employee QR to log attendance</Text>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleScan}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />

        {/* Viewfinder frame */}
        <View style={styles.overlay}>
          <View style={styles.frame}>
            {loading && (
              <Text style={styles.loadingText}>Processing…</Text>
            )}
          </View>
        </View>
      </View>

      {!scanned && (
        <View style={styles.tip}>
          <Text style={styles.tipText}>Align the QR code inside the frame</Text>
        </View>
      )}

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.resultCard, { borderTopColor: result?.success ? '#10b981' : '#ef4444' }]}>
            <Text style={[styles.resultIcon]}>
              {result?.success ? '✅' : '❌'}
            </Text>
            {result?.employee && (
              <Text style={styles.resultName}>{result.employee}</Text>
            )}
            {result?.action && (
              <Text style={styles.resultAction}>{result.action}</Text>
            )}
            {result?.time && (
              <Text style={styles.resultTime}>{result.time}</Text>
            )}
            <Text style={[styles.resultMsg, { color: result?.success ? '#065f46' : '#991b1b' }]}>
              {result?.message}
            </Text>
            <TouchableOpacity style={[styles.scanAgainBtn, { backgroundColor: result?.success ? '#10b981' : '#4f46e5' }]} onPress={reset}>
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const FRAME = 240;
const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: '#000' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#f5f3ff' },
  permText:        { fontSize: 15, color: '#374151', textAlign: 'center', marginBottom: 20 },
  permBtn:         { backgroundColor: '#4f46e5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  permBtnText:     { color: '#fff', fontWeight: '600', fontSize: 15 },
  header:          { backgroundColor: '#1e1b4b', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:     { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub:       { color: '#c7d2fe', fontSize: 13, marginTop: 2 },
  cameraContainer: { flex: 1, position: 'relative' },
  overlay:         { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  frame:           { width: FRAME, height: FRAME, borderWidth: 3, borderColor: '#a5b4fc', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  loadingText:     { color: '#fff', fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tip:             { backgroundColor: '#1e1b4b', padding: 16, alignItems: 'center' },
  tipText:         { color: '#c7d2fe', fontSize: 13 },
  modalOverlay:    { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  resultCard:      { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, alignItems: 'center', borderTopWidth: 5 },
  resultIcon:      { fontSize: 48, marginBottom: 8 },
  resultName:      { fontSize: 20, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 4 },
  resultAction:    { fontSize: 14, color: '#6b7280', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  resultTime:      { fontSize: 24, fontWeight: '700', color: '#4f46e5', marginBottom: 8 },
  resultMsg:       { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  scanAgainBtn:    { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  scanAgainText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});
