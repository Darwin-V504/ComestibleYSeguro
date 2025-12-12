import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { InventoryItem } from "../infoutils/types/Products";
import { Ionicons } from "@expo/vector-icons";
import CButton from "./CButton";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { getThemeColors } from "../infoutils/theme";

type Props = {
  item: InventoryItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
};

export default function ProductCard({ item, onRemove, onUpdateQuantity }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors); 

  const daysUntilExpiry = Math.ceil(
    (item.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={[styles.card, item.isExpiring && styles.expiringCard]}>
      <View style={styles.header}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <TouchableOpacity onPress={() => onRemove(item.product.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.category}>
          {t(item.product.category)}
        </Text>
        <Text style={[styles.expiry, daysUntilExpiry <= 4 && styles.expiringText]}>
          {daysUntilExpiry <= 0 
            ? t('expired') 
            : `${t('expiresIn')} ${daysUntilExpiry} ${t('days')}`
          }
        </Text>
      </View>
      
      <View style={styles.quantityRow}>
        <Text style={styles.quantityLabel}>{t('quantity')}:</Text>
        <View >
          <CButton 
            title="-" 
            variant="tertiary" 
            onPress={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
            size="small"
          />
          <Text style={styles.quantityNumber}>{item.quantity}</Text>
          <CButton 
            title="+" 
            variant="tertiary" 
            onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
            size="small"
          />
        </View>
      </View>
    </View>
  );
}

// ✅ FUNCIÓN getStyles DEFINIDA
const getStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expiringCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    flex: 1,
  },
  expiry: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  expiringText: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    minWidth: 30,
    textAlign: 'center',
  },
});