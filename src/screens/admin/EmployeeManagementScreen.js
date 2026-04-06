import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, TextInput, Modal, ScrollView,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_COLOR = { Active: '#10b981', Inactive: '#9ca3af', Resigned: '#ef4444' };

export default function EmployeeManagementScreen() {
  const [employees, setEmployees]   = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [query, setQuery]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState(null); // for detail view

  const load = useCallback(async () => {
    try {
      const res = await api.get('/get_employee_details.php?all=1');
      const list = res.data?.employees ?? [];
      setEmployees(list);
      setFiltered(list);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const search = (q) => {
    setQuery(q);
    const lq = q.toLowerCase();
    setFiltered(employees.filter(e =>
      e.first_name?.toLowerCase().includes(lq) ||
      e.last_name?.toLowerCase().includes(lq) ||
      e.department?.toLowerCase().includes(lq) ||
      e.email?.toLowerCase().includes(lq)
    ));
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    Alert.alert(
      'Confirm',
      `Set ${emp.first_name} ${emp.last_name} to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const res = await api.post('/update_employee.php', {
                employee_id: emp.employee_id,
                status: newStatus,
              });
              if (res.data.success) { load(); }
              else Alert.alert('Error', res.data.message);
            } catch (e) { Alert.alert('Error', 'Failed to update.'); }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Employees</Text>
        <Text style={styles.headerCount}>{employees.length} total</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, dept, email..."
          value={query}
          onChangeText={search}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item.employee_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
            <View style={styles.cardRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {item.first_name?.[0]}{item.last_name?.[0]}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.empName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.empDetail}>{item.job_title} · {item.department}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[item.status] ?? '#6b7280') + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] ?? '#6b7280' }]}>{item.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No employees found.</Text>}
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView style={styles.modal}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>{selected.first_name} {selected.last_name}</Text>
                {[
                  ['Employee ID', selected.employee_id],
                  ['Email',       selected.email],
                  ['Job Title',   selected.job_title],
                  ['Department',  selected.department],
                  ['Date Hired',  selected.hired_date],
                  ['Status',      selected.status],
                  ['Role',        selected.role],
                ].map(([l, v]) => (
                  <View key={l} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{l}</Text>
                    <Text style={styles.detailValue}>{v ?? '—'}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: selected.status === 'Active' ? '#ef4444' : '#10b981' }]}
                  onPress={() => { toggleStatus(selected); setSelected(null); }}
                >
                  <Text style={styles.btnText}>
                    Set to {selected.status === 'Active' ? 'Inactive' : 'Active'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelected(null)} style={{ marginBottom: 32 }}>
                  <Text style={styles.cancel}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
  headerCount:  { color: '#c7d2fe', fontSize: 13 },
  searchBox:    { padding: 12 },
  searchInput:  { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  cardRow:      { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ede9fe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText:   { color: '#4f46e5', fontWeight: 'bold', fontSize: 15 },
  cardInfo:     { flex: 1 },
  empName:      { fontWeight: '700', color: '#1e1b4b', fontSize: 14 },
  empDetail:    { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle:   { fontSize: 20, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 16 },
  detailRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel:  { color: '#6b7280', fontSize: 13 },
  detailValue:  { color: '#111827', fontSize: 13, fontWeight: '500' },
  btn:          { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancel:       { textAlign: 'center', color: '#6b7280', paddingVertical: 8 },
});
