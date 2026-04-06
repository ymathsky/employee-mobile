import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, TextInput,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function TeamAttendanceScreen() {
  const [logs, setLogs]             = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [query, setQuery]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/team_attendance_overview.php');
      const list = res.data?.attendance ?? [];
      setLogs(list);
      setFiltered(list);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const search = (q) => {
    setQuery(q);
    setFiltered(logs.filter(l => l.employee_name?.toLowerCase().includes(q.toLowerCase())));
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Team Attendance</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search employee..."
          value={query}
          onChangeText={search}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item.log_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.empName}>{item.employee_name}</Text>
              <View style={[styles.badge, item.time_out ? styles.badgeDone : styles.badgeActive]}>
                <Text style={styles.badgeText}>{item.time_out ? 'Done' : 'Active'}</Text>
              </View>
            </View>
            <Text style={styles.dept}>{item.department}</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>In: <Text style={styles.timeVal}>{item.time_in ?? '—'}</Text></Text>
              <Text style={styles.timeLabel}>Out: <Text style={styles.timeVal}>{item.time_out ?? '—'}</Text></Text>
              <Text style={styles.timeLabel}>Hrs: <Text style={styles.timeVal}>{item.hours_worked ?? '—'}</Text></Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No attendance records found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  headerBar:    { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  searchBox:    { padding: 12 },
  searchInput:  { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  empName:      { fontWeight: '700', color: '#1e1b4b', fontSize: 15 },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeActive:  { backgroundColor: '#d1fae5' },
  badgeDone:    { backgroundColor: '#f3f4f6' },
  badgeText:    { fontSize: 11, fontWeight: '600', color: '#374151' },
  dept:         { fontSize: 12, color: '#9ca3af', marginBottom: 8 },
  timeRow:      { flexDirection: 'row', gap: 16 },
  timeLabel:    { fontSize: 13, color: '#6b7280' },
  timeVal:      { fontWeight: '600', color: '#111827' },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
