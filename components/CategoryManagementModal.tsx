import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Category } from '@/contexts/AppContext';
import EmojiSelector from 'react-native-emoji-selector';
import * as Icon from 'lucide-react-native';
import { Edit2, Trash2, Plus } from 'lucide-react-native';

interface CategoryManagementModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
}

export function CategoryManagementModal({ visible, onClose, type }: CategoryManagementModalProps) {
  const { colors } = useTheme();
  const { expenseCategories, incomeCategories, addCategory, updateCategory, deleteCategory } = useAppContext();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '',
    color: '#000000',
  });

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const resetForm = () => {
    setFormData({
      name: '',
      emoji: '',
      color: '#000000',
    });
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert('Hata', 'Kategori adı boş olamaz');
        return;
      }

      const categoryData = {
        name: formData.name.trim(),
        emoji: formData.emoji,
        color: formData.color,
        icon: 'circle',
        type,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }

      resetForm();
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  const handleDelete = async (category: Category) => {
    Alert.alert(
      'Kategoriyi Sil',
      'Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
            } catch (error) {
              Alert.alert('Hata', error instanceof Error ? error.message : 'Bir hata oluştu');
            }
          },
        },
      ],
    );
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      emoji: category.emoji || '',
      color: category.color,
    });
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {type === 'expense' ? 'Gider Kategorileri' : 'Gelir Kategorileri'}
        </Text>

        <ScrollView style={styles.categoriesList}>
          {categories.map((category) => (
            <View key={category.id} style={[styles.categoryItem, { borderColor: colors.border }]}>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryEmoji]}>
                  {category.emoji || '⭕️'}
                </Text>
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {category.name}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleEdit(category)}
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                >
                  <Edit2 size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(category)}
                  style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                >
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.form}>
          <Input
            label="Kategori Adı"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Kategori adı girin"
          />

          <TouchableOpacity
            style={[styles.emojiButton, { borderColor: colors.border }]}
            onPress={() => setShowEmojiPicker(true)}
          >
            <Text style={styles.emojiButtonText}>
              {formData.emoji || 'Emoji Seç 😊'}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button
              title={editingCategory ? 'Güncelle' : 'Ekle'}
              onPress={handleSubmit}
              icon={editingCategory ? <Edit2 size={20} /> : <Plus size={20} />}
            />
          </View>
        </View>

        <Modal visible={showEmojiPicker} onClose={() => setShowEmojiPicker(false)}>
          <View style={styles.emojiPicker}>
            <EmojiSelector
              onEmojiSelected={(emoji) => {
                setFormData(prev => ({ ...prev, emoji }));
                setShowEmojiPicker(false);
              }}
              showSearchBar={false}
              columns={8}
            />
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriesList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 16,
  },
  emojiButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  emojiButtonText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
  emojiPicker: {
    height: 400,
  },
}); 