import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAllPOs } from '@/store/thunks/poThunks';
import { Colors } from '@/constants/colors';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { POStatus, PurchaseOrder } from '@/types';

const STATUS_TABS = [
  { key: 'all' as const, label: 'All' },
  { key: 'ordered' as const, label: 'Ordered' },
  { key: 'in_process' as const, label: 'In Process' },
  { key: 'completed' as const, label: 'Completed' },
];

const STATUS_COLORS: Record<POStatus, { bg: string; text: string }> = {
  ordered: { bg: Colors.statusOrderedBg, text: Colors.statusOrderedText },
  in_process: { bg: Colors.statusInProcessBg, text: Colors.statusInProcessText },
  completed: { bg: Colors.statusCompletedBg, text: Colors.statusCompletedText },
};

const STATUS_LABELS: Record<POStatus, string> = {
  ordered: 'Ordered',
  in_process: 'In Process',
  completed: 'Completed',
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<'all' | POStatus>('all');
  const dispatch = useAppDispatch();
  const allPOs = useAppSelector((state) => state.session.allPOs);
  const loading = useAppSelector((state) => state.ui.loading.pos);

  useEffect(() => {
    dispatch(fetchAllPOs('default-mart'));
  }, [dispatch]);

  const filteredPOs =
    activeTab === 'all'
      ? allPOs
      : allPOs.filter((po) => po.status === activeTab);

  const onRefresh = useCallback(() => {
    dispatch(fetchAllPOs('default-mart'));
  }, [dispatch]);

  const renderPOCard = ({ item }: { item: PurchaseOrder }) => {
    const statusColor = STATUS_COLORS[item.status];
    const total = item.items.reduce(
      (sum, i) => sum + i.quantity * i.unit_price,
      0
    );

    return (
      <Pressable
        className="bg-white rounded-xl border border-border-default p-4 mb-2"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        onPress={() => router.push(`/orders/${item.id}`)}
      >
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-base font-semibold text-text-primary flex-1">
            {item.distributor.name}
          </Text>
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: statusColor.bg }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusColor.text }}
            >
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-text-secondary mb-1">
          {formatDate(item.created_at)} · {item.items.length} items
        </Text>
        <Text className="text-base font-bold text-text-primary">
          {formatCurrency(total)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#F8F8F8]">
      {/* Status Filter Tabs */}
      <View className="flex-row bg-white border-b border-border-default px-2">
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            className="flex-1 items-center py-3"
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color:
                  activeTab === tab.key
                    ? Colors.primary
                    : Colors.textSecondary,
              }}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <View className="absolute bottom-0 left-2 right-2 h-0.5 bg-suvidha-orange rounded-full" />
            )}
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredPOs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-text-disabled text-5xl mb-4">📋</Text>
          <Text className="text-base font-semibold text-text-primary text-center">
            {activeTab === 'all'
              ? 'No orders yet'
              : `No ${STATUS_LABELS[activeTab as POStatus].toLowerCase()} orders`}
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-1">
            {activeTab === 'all'
              ? 'Start by searching for a distributor.'
              : 'Try a different filter.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPOs}
          keyExtractor={(item) => item.id}
          renderItem={renderPOCard}
          contentContainerStyle={{ padding: 16 }}
          refreshing={loading}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}
