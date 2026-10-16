import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Switch,
  StyleSheet,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export default function SettingRow({
  label,
  subLabel,
  icon: Icon,
  iconColor,
  isSwitch,
  value,
  onValueChange,
  theme,
  color,
  onPress,
  badge,
  isLast,
  danger,
}) {
  // Couleur du texte : rouge si danger, sinon couleur passée ou thème
  const textColor = danger ? COLORS.danger : color || theme.text;
  const subTextColor = danger
    ? COLORS.danger + 'B0'
    : theme.subText || '#6b7280';
  const accentColor =
    iconColor || (danger ? COLORS.danger : COLORS.primary);

  const rowBg = theme.card || '#fff';

  const content = (
    <View
      style={[
        styles.row,
        {
          backgroundColor: rowBg,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: theme.track || 'rgba(0,0,0,0.05)',
        },
      ]}
    >
      {/* Côté gauche : icône + labels */}
      <View style={styles.left}>
        {Icon && (
          <View
            style={[
              styles.iconBox,
              { backgroundColor: accentColor + '18' },
            ]}
          >
            <Icon size={18} color={accentColor} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
            {label}
          </Text>
          {subLabel && (
            <Text
              style={[styles.subLabel, { color: subTextColor }]}
              numberOfLines={2}
            >
              {subLabel}
            </Text>
          )}
        </View>

        {/* Badge optionnel */}
        {badge && (
          <View
            style={[
              styles.badge,
              { backgroundColor: accentColor + '18' },
            ]}
          >
            <Text style={[styles.badgeText, { color: accentColor }]}>
              {badge}
            </Text>
          </View>
        )}
      </View>

      {/* Côté droit : switch ou chevron */}
      <View style={styles.right}>
        {isSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
              false: '#d1d5db',
              true: COLORS.primary + '80',
            }}
            thumbColor={value ? COLORS.primary : '#f4f3f4'}
            ios_backgroundColor="#d1d5db"
          />
        ) : (
          <ChevronRight
            size={18}
            color={theme.subText || '#9ca3af'}
            strokeWidth={2.2}
          />
        )}
      </View>
    </View>
  );

  // Si c'est un switch, on ne wrap pas dans TouchableOpacity
  if (isSwitch) {
    return content;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 62,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  right: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});