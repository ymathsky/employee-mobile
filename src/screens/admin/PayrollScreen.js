import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_COLOR = { paid: '#10b981', unpaid: '#f59e0b', draft: '#6b7280' };

export default function PayrollScreen() {
  const [payrolls, setPayrolls]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/pay_history.php?all=1');
      setPayrolls(res.data?.payrolls ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markPaid = async (payrollId) => {
    Alert.alert('Confirm', 'Mark this payroll run as paid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Paid',
        onPress: async () => {
          try {
            const res = await api.post('/update_payroll.php', {
              payroll_id: payrollId,
              status: 'paid',
            });
            if (res.data.success) load();
            else Alert.alert('Error', res.data.message);
          } catch (e) { Alert.alert('Error', 'Failed.'); }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Payroll</Text>
      </View>

      <FlatList
        data={payrolls}
        keyExtractor={(item, i) => String(item.payroll_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.period}>{item.pay_period_label ?? item.pay_period}</Text>
              <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[item.status] ?? '#6b7280') + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] ?? '#6b7280' }]}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.runDate}>Run: {item.run_date} · {item.employee_count ?? '?'} employees</Text>
            <View style={styles.amtRow}>
              <AmtItem label="Gross"      value={item.total_gross} color="#4f46e5" />
              <AmtItem label="Deductions" value={item.total_deductions} color="#ef4444" />
              <AmtItem label="Net"        value={item.total_net} color="#10b981" />
            </View>
            {item.status === 'unpaid' && (
              <TouchableOpacity style={styles.markPaidBtn} onPress={() => markPaid(item.payroll_id)}>
                <Text style={styles.markPaidText}>Mark as Paid</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No payroll records found.</Text>}
      />
    </View>
  );
}

function AmtItem({ label, value, color }) {
  return (
    <View style={styles.amtItem}>
      <Text style={[styles.amtValue, { color }]}>
        ₱{parseFloat(value ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      </Text>
      <Text style={styles.amtLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  headerBar:    { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  period:       { fontWeight: '700', fontSize: 15, color: '#1e1b4b', flex: 1 },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  runDate:      { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  amtRow:       { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  amtItem:      { flex: 1, alignItems: 'center' },
  amtValue:     { fontSize: 13, fontWeight: '700' },
  amtLabel:     { fontSize: 11, color: '#6b7280', marginTop: 2 },
  markPaidBtn:  { marginTop: 12, backgroundColor: '#ede9fe', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  markPaidText: { color: '#4f46e5', fontWeight: '700' },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
