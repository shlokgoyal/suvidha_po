import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchDistributorByNumber } from '@/store/thunks/distributorThunks';
import { setCartDistributor } from '@/store/slices/cartSlice';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const [distNumber, setDistNumber] = useState('');
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.ui.loading.distributor);
  const error = useAppSelector((state) => state.ui.errors.distributor);

  const handleSearch = async () => {
    const trimmed = distNumber.trim();
    if (!trimmed) return;

    try {
      const result = await dispatch(fetchDistributorByNumber(trimmed)).unwrap();
      dispatch(setCartDistributor(result.id));
      router.push(`/distributor/${result.id}/brands`);
    } catch {
      // error is handled by uiSlice
    }
  };

  return (
    <View className="flex-1 bg-[#F8F8F8] px-4 pt-8">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-suvidha-orange items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">S</Text>
        </View>
        <Text className="text-2xl font-bold text-text-primary">Suvidha PO</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Purchase Order System
        </Text>
      </View>

      <Text className="text-xl font-bold text-text-primary mb-4">
        Enter Distributor Number
      </Text>

      <TextInput
        className="bg-white border border-border-default rounded-lg px-4 py-3 text-base text-text-primary mb-3"
        placeholder="e.g. DIST-001"
        placeholderTextColor={Colors.textDisabled}
        value={distNumber}
        onChangeText={setDistNumber}
        autoCapitalize="characters"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />

      {error && (
        <Text className="text-error text-sm mb-3">{error}</Text>
      )}

      <Pressable
        className="bg-suvidha-orange rounded-lg py-3.5 items-center"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        onPress={handleSearch}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-semibold text-base">Search</Text>
        )}
      </Pressable>
    </View>
  );
}
