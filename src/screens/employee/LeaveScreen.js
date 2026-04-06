import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert, RefreshControl, ScrollView, Platform,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_COLOR = { Approved: '#10b981', Pending: '#f59e0b', Rejected: '#ef4444' };

export default function LeaveScreen() {
  const [leaves, setLeaves]         = useState([]);
  const [balance, setBalance]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ leave_type: 'Vacation Leave', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [leavesRes, balRes] = await Promise.all([
        api.get('/submit_leave_request.php?action=list'),
        api.get('/get_leave_balances.php'),
      ]);
      setLeaves(leavesRes.data?.requests ?? []);
      setBalance(balRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.start_date || !form.end_date || !form.reason) {
      Alert.alert('Required', 'Please fill all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/submit_leave_request.php', form);
      if (res.data.success) {
        Alert.alert('Submitted', 'Leave request submitted.');
        setShowModal(false);
        setForm({ leave_type: 'Vacation Leave', start_date: '', end_date: '', reason: '' });
        load();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) { Alert.alert('Error', 'Failed to submit.'); }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const leaveTypes = ['Vacation Leave', 'Sick Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave'];

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Leave</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Balance */}
      {balance && (
        <View style={styles.balanceRow}>
          {Object.entries(balance).map(([type, bal]) => (
            <View key={type} style={styles.balCard}>
              <Text style={styles.balValue}>{bal}</Text>
              <Text style={styles.balLabel}>{type.replace(' Leave', '')}</Text>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={leaves}
        keyExtractor={(item, i) => String(item.leave_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.leaveCard}>
            <View style={styles.leaveHeader}>
              <Text style={styles.leaveType}>{item.leave_type}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] ?? '#6b7280' }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.leaveDates}>{item.start_date} → {item.end_date}</Text>
            <Text style={styles.leaveReason}>{item.reason}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No leave requests found.</Text>}
      />

      {/* Apply Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView style={styles.modal} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Apply for Leave</Text>

            <Text style={styles.fieldLabel}>Leave Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {leaveTypes.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, form.leave_type === t && styles.typeChipActive]}
                  onPress={() => setForm(f => ({ ...f, leave_type: t }))}
                >
                  <Text style={[styles.typeChipText, form.leave_type === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2025-01-01" value={form.start_date} onChangeText={v => setForm(f => ({ ...f, start_date: v }))} />

            <Text style={styles.fieldLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2025-01-03" value={form.end_date} onChangeText={v => setForm(f => ({ ...f, end_date: v }))} />

            <Text style={styles.fieldLabel}>Reason</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Reason for leave..." value={form.reason} onChangeText={v => setForm(f => ({ ...f, reason: v }))} />

            <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
              <Text style={styles.btnText}>{submitting ? 'Submitting…' : 'Submit Request'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginBottom: 24 }}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  headerBar:    { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  addBtn:       { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  addBtnText:   { color: '#4f46e5', fontWeight: '700' },
  balanceRow:   { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  balCard:      { flex: 1, minWidth: 80, backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center' },
  balValue:     { fontSize: 22, fontWeight: 'bold', color: '#4f46e5' },
  balLabel:     { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 2 },
  leaveCard:    { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  leaveHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  leaveType:    { fontWeight: '700', color: '#1e1b4b' },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText:   { color: '#fff', fontSize: 11, fontWeight: '600' },
  leaveDates:   { fontSize: 13, color: '#374151', marginBottom: 4 },
  leaveReason:  { fontSize: 12, color: '#6b7280' },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 16 },
  fieldLabel:   { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  typeChip:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  typeChipActive:{ backgroundColor: '#4f46e5' },
  typeChipText: { fontSize: 13, color: '#374151' },
  input:        { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 16 },
  btn:          { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnText:      { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancel:       { textAlign: 'center', color: '#6b7280', paddingVertical: 8 },
});
