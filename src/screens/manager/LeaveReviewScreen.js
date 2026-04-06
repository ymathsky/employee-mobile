import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, TextInput, Modal, ScrollView,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_COLOR = { Approved: '#10b981', Pending: '#f59e0b', Rejected: '#ef4444' };

export default function LeaveReviewScreen() {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [remarks, setRemarks]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/review_leave_request.php?action=list');
      setRequests(res.data?.requests ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const review = async (status) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await api.post('/review_leave_request.php', {
        leave_id: selected.leave_id,
        status,
        remarks,
      });
      if (res.data.success) {
        Alert.alert(status, `Leave request ${status.toLowerCase()}.`);
        setSelected(null);
        setRemarks('');
        load();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) { Alert.alert('Error', 'Action failed.'); }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Leave Requests</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item, i) => String(item.leave_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => { if (item.status === 'Pending') { setSelected(item); setRemarks(''); } }}
            activeOpacity={item.status === 'Pending' ? 0.7 : 1}
          >
            <View style={styles.cardTop}>
              <Text style={styles.empName}>{item.employee_name}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.leaveType}>{item.leave_type}</Text>
            <Text style={styles.dates}>{item.start_date} → {item.end_date}</Text>
            <Text style={styles.reason}>{item.reason}</Text>
            {item.status === 'Pending' && (
              <Text style={styles.tapHint}>Tap to review</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No leave requests found.</Text>}
      />

      {/* Review Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Review Leave Request</Text>
            {selected && (
              <>
                <Text style={styles.modalInfo}><Text style={styles.bold}>{selected.employee_name}</Text> · {selected.leave_type}</Text>
                <Text style={styles.modalInfo}>{selected.start_date} → {selected.end_date}</Text>
                <Text style={styles.modalReason}>{selected.reason}</Text>
              </>
            )}
            <TextInput
              style={[styles.input, { height: 70 }]}
              placeholder="Remarks (optional)..."
              multiline
              value={remarks}
              onChangeText={setRemarks}
            />
            <View style={styles.reviewBtns}>
              <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: '#10b981' }]} onPress={() => review('Approved')} disabled={submitting}>
                <Text style={styles.reviewBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: '#ef4444' }]} onPress={() => review('Rejected')} disabled={submitting}>
                <Text style={styles.reviewBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)}>
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
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  empName:      { fontWeight: '700', fontSize: 15, color: '#1e1b4b' },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  leaveType:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 },
  dates:        { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  reason:       { fontSize: 12, color: '#9ca3af' },
  tapHint:      { fontSize: 11, color: '#4f46e5', marginTop: 6, fontStyle: 'italic' },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 12 },
  modalInfo:    { fontSize: 14, color: '#374151', marginBottom: 4 },
  modalReason:  { fontSize: 13, color: '#6b7280', marginBottom: 16, fontStyle: 'italic' },
  bold:         { fontWeight: '700' },
  input:        { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 16 },
  reviewBtns:   { flexDirection: 'row', gap: 12, marginBottom: 12 },
  reviewBtn:    { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  reviewBtnText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
  cancel:       { textAlign: 'center', color: '#6b7280', paddingVertical: 8 },
});
