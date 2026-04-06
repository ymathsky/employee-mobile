import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const REFRESH_INTERVAL = 55; // seconds before expiry (token valid 60s)

export default function MyQRCodeScreen() {
  const { user } = useAuth();
  const [token, setToken]       = useState(null);
  const [pin, setPin]           = useState('------');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [loading, setLoading]   = useState(true);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchToken = useCallback(async () => {
    try {
      const res = await api.get('/generate_qr_token.php?mode=all');
      if (res.data.success) {
        setToken(res.data.token);
        setPin(res.data.pin ?? '------');
        setCountdown(REFRESH_INTERVAL);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not load QR code.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();

    // Auto-refresh token every 55 seconds
    timerRef.current = setInterval(fetchToken, REFRESH_INTERVAL * 1000);

    // Countdown ticker
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : REFRESH_INTERVAL));
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [fetchToken]);

  if (loading) return <LoadingSpinner fullScreen />;

  const urgency = countdown <= 10 ? '#ef4444' : countdown <= 20 ? '#f59e0b' : '#10b981';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>My QR Code</Text>
        <Text style={styles.subtitle}>
          {user?.first_name} {user?.last_name} · ID: {user?.employee_id}
        </Text>

        <Text style={styles.hint}>Show this code to the kiosk scanner to clock in/out.</Text>

        {token ? (
          <View style={styles.qrWrapper}>
            <QRCode
              value={token}
              size={220}
              color="#1e1b4b"
              backgroundColor="#fff"
            />
          </View>
        ) : (
          <View style={[styles.qrWrapper, styles.qrError]}>
            <Text style={styles.qrErrorText}>Failed to load QR</Text>
          </View>
        )}

        {/* Countdown */}
        <View style={styles.countdownRow}>
          <View style={[styles.countdownBadge, { backgroundColor: urgency + '22' }]}>
            <Text style={[styles.countdownText, { color: urgency }]}>
              Refreshes in {countdown}s
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setLoading(true); fetchToken(); }} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* PIN */}
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>Kiosk PIN</Text>
          <Text style={styles.pinHint}>Use this if you cannot scan your QR code</Text>
          <View style={styles.pinBadge}>
            <Text style={styles.pinText}>{pin}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: '#f5f3ff' },
  container:      { padding: 20, alignItems: 'center', paddingTop: 60 },
  card:           { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
  title:          { fontSize: 22, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 4 },
  subtitle:       { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  hint:           { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  qrWrapper:      { padding: 12, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 16 },
  qrError:        { width: 220, height: 220, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fef2f2' },
  qrErrorText:    { color: '#ef4444' },
  countdownRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  countdownBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  countdownText:  { fontWeight: '700', fontSize: 13 },
  refreshBtn:     { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ede9fe', borderRadius: 20 },
  refreshBtnText: { color: '#4f46e5', fontWeight: '600', fontSize: 13 },
  pinSection:     { width: '100%', alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pinLabel:       { fontSize: 16, fontWeight: '700', color: '#1e1b4b', marginBottom: 4 },
  pinHint:        { fontSize: 12, color: '#9ca3af', marginBottom: 12, textAlign: 'center' },
  pinBadge:       { backgroundColor: '#ede9fe', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  pinText:        { fontSize: 36, fontWeight: 'bold', color: '#4f46e5', letterSpacing: 8, fontVariant: ['tabular-nums'] },
});
