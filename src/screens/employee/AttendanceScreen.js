import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, Modal, TextInput, FlatList,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AttendanceScreen() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/get_employee_daily_logs.php');
      setLogs(res.data?.logs ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const clockIn = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/log_attendance.php', { action: 'time_in', note });
      if (res.data.success) {
        Alert.alert('Clocked In', res.data.message || 'Time-in recorded.');
        setShowModal(false);
        setNote('');
        load();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to clock in. Try again.');
    }
    setSubmitting(false);
  };

  const clockOut = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/log_attendance.php', { action: 'time_out' });
      if (res.data.success) {
        Alert.alert('Clocked Out', res.data.message || 'Time-out recorded.');
        load();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to clock out.');
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Attendance</Text>
      </View>

      {/* Actions */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={() => setShowModal(true)}>
          <Text style={styles.actionBtnText}>Clock In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={clockOut} disabled={submitting}>
          <Text style={styles.actionBtnText}>Clock Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item, i) => String(item.log_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logDate}>{item.log_date}</Text>
            <View style={styles.logRow}>
              <View style={styles.logItem}>
                <Text style={styles.logLabel}>Time In</Text>
                <Text style={styles.logValue}>{item.time_in ?? '—'}</Text>
              </View>
              <View style={styles.logItem}>
                <Text style={styles.logLabel}>Time Out</Text>
                <Text style={styles.logValue}>{item.time_out ?? '—'}</Text>
              </View>
              <View style={styles.logItem}>
                <Text style={styles.logLabel}>Hours</Text>
                <Text style={styles.logValue}>{item.hours_worked ?? '—'}</Text>
              </View>
            </View>
            {item.remarks ? <Text style={styles.logRemarks}>{item.remarks}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No logs found.</Text>}
      />

      {/* Clock In Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Clock In</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional note..."
              value={note}
              onChangeText={setNote}
            />
            <TouchableOpacity style={styles.btn} onPress={clockIn} disabled={submitting}>
              <Text style={styles.btnText}>{submitting ? 'Submitting…' : 'Confirm Clock In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  headerBar:    { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  btnRow:       { flexDirection: 'row', gap: 12, padding: 16 },
  actionBtn:    { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  actionBtnText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
  logCard:      { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  logDate:      { fontWeight: '700', color: '#1e1b4b', marginBottom: 8 },
  logRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  logItem:      { flex: 1, alignItems: 'center' },
  logLabel:     { fontSize: 11, color: '#6b7280' },
  logValue:     { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
  logRemarks:   { marginTop: 8, fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 16 },
  input:        { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 16 },
  btn:          { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnText:      { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancel:       { textAlign: 'center', color: '#6b7280', paddingVertical: 8 },
});
