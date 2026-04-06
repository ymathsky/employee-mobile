import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, TextInput, Modal,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DepartmentScreen() {
  const [depts, setDepts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);  // null = add, obj = edit
  const [form, setForm]             = useState({ name: '', description: '' });
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/get_departments.php');
      setDepts(res.data?.departments ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (dept) => { setEditing(dept); setForm({ name: dept.name, description: dept.description ?? '' }); setShowModal(true); };

  const save = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Department name is required.'); return; }
    setSaving(true);
    try {
      const endpoint = editing ? '/update_department.php' : '/add_department.php';
      const payload  = editing
        ? { department_id: editing.department_id, ...form }
        : form;
      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        setShowModal(false);
        load();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) { Alert.alert('Error', 'Failed to save.'); }
    setSaving(false);
  };

  const deleteDept = (dept) => {
    Alert.alert('Delete', `Delete "${dept.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const res = await api.post('/delete_department.php', { department_id: dept.department_id });
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
        <Text style={styles.headerTitle}>Departments</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={depts}
        keyExtractor={(item, i) => String(item.department_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.deptName}>{item.name}</Text>
                <Text style={styles.deptDesc}>{item.description ?? 'No description'}</Text>
                <Text style={styles.deptCount}>{item.employee_count ?? 0} employees</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.delBtn} onPress={() => deleteDept(item)}>
                  <Text style={styles.delBtnText}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No departments found.</Text>}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Department' : 'Add Department'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Department Name *"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />
            <TextInput
              style={[styles.input, { height: 70 }]}
              placeholder="Description (optional)"
              multiline
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
            />
            <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
              <Text style={styles.btnText}>{saving ? 'Saving…' : 'Save Department'}</Text>
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
  headerBar:    { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  addBtn:       { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  addBtnText:   { color: '#4f46e5', fontWeight: '700' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardRow:      { flexDirection: 'row', alignItems: 'center' },
  deptName:     { fontWeight: '700', fontSize: 15, color: '#1e1b4b' },
  deptDesc:     { fontSize: 12, color: '#6b7280', marginTop: 2 },
  deptCount:    { fontSize: 12, color: '#4f46e5', marginTop: 4, fontWeight: '500' },
  actions:      { flexDirection: 'row', gap: 8 },
  editBtn:      { backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText:  { color: '#4f46e5', fontWeight: '600', fontSize: 13 },
  delBtn:       { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  delBtnText:   { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 16 },
  input:        { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 14 },
  btn:          { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnText:      { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancel:       { textAlign: 'center', color: '#6b7280', paddingVertical: 8 },
});
